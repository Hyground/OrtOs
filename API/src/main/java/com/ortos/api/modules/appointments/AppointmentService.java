package com.ortos.api.modules.appointments;

import com.ortos.api.modules.patients.PacienteRepository;
import com.ortos.api.modules.staff.MedicoRepository;
import com.ortos.api.shared.exception.ApiException;
import com.ortos.api.shared.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;
import java.util.UUID;

@Service
public class AppointmentService {
    private static final Set<String> BLOCKING_STATUS_NAMES = Set.of("programada", "confirmada", "en atención");
    private final CitaRepository citas;
    private final PacienteRepository patients;
    private final MedicoRepository doctors;
    private final AppointmentTypeRepository types;
    private final AppointmentPriorityRepository priorities;
    private final AppointmentStatusRepository statuses;
    private final NotificationService notifications;

    public AppointmentService(CitaRepository citas, PacienteRepository patients, MedicoRepository doctors,
                              AppointmentTypeRepository types, AppointmentPriorityRepository priorities,
                              AppointmentStatusRepository statuses, NotificationService notifications) {
        this.citas = citas; this.patients = patients; this.doctors = doctors;
        this.types = types; this.priorities = priorities; this.statuses = statuses;
        this.notifications = notifications;
    }

    public List<AppointmentDto> findAll(String patientId, String doctorId, Short statusId, LocalDate date,
                                        OffsetDateTime from, OffsetDateTime to) {
        if (date != null) {
            if (from != null || to != null) throw ApiException.badRequest("Usa date o el rango from/to, no ambos.");
            from = date.atStartOfDay().atOffset(ZoneOffset.UTC);
            to = from.plusDays(1);
        }
        validateOptionalRange(from, to);
        return citas.search(patientId, doctorId, statusId, from, to).stream().map(this::toDto).toList();
    }
    public List<AppointmentDto> findByPatient(String patientId) { return citas.findByPatientId(patientId).stream().map(this::toDto).toList(); }
    public List<AppointmentDto> findByDoctor(String doctorId) { return citas.findByDoctorId(doctorId).stream().map(this::toDto).toList(); }
    public List<AppointmentDto> findByDate(LocalDate date) { return findByDateEntities(date).stream().map(this::toDto).toList(); }
    public List<AppointmentType> findTypes() { return types.findAll(); }
    public List<AppointmentPriority> findPriorities() { return priorities.findAll(); }
    public List<AppointmentStatus> findStatuses() { return statuses.findAll(); }
    public AppointmentDto findById(String id) { return toDto(getEntity(id)); }

    public List<CalendarAppointmentDto> calendar(String patientId, String doctorId, OffsetDateTime from, OffsetDateTime to) {
        validateRequiredRange(from, to);
        List<Cita> appointments = citas.search(patientId, doctorId, null, from, to);
        Map<String, String> patientNames = patientNames(appointments);
        Map<String, String> doctorNames = doctorNames(appointments);
        Map<Short, String> typeNames = typeNames();
        Map<Short, String> priorityNames = priorityNames();
        Map<Short, String> statusNames = statusNames();
        return appointments.stream().map(appointment -> calendarDto(appointment, patientNames, doctorNames, typeNames, priorityNames, statusNames)).toList();
    }

    public AvailabilityDto availability(String doctorId, OffsetDateTime from, OffsetDateTime to) {
        ensureDoctorExists(doctorId);
        validateRequiredRange(from, to);
        Map<Short, String> statusNames = statusNames();
        List<OccupiedSlotDto> slots = citas.findBlockingInRange(doctorId, from, to, BLOCKING_STATUS_NAMES).stream()
                .map(appointment -> occupiedSlot(appointment, statusNames.get(appointment.getStatusId()))).toList();
        AvailabilityDto dto = new AvailabilityDto();
        dto.setDoctorId(doctorId); dto.setFrom(from); dto.setTo(to); dto.setOccupiedSlots(slots);
        return dto;
    }

    public AvailabilityCheckDto checkAvailability(String doctorId, OffsetDateTime appointmentAt, UUID excludeAppointmentId) {
        ensureDoctorExists(doctorId);
        if (appointmentAt == null) throw ApiException.badRequest("appointmentAt es obligatorio.");
        Cita conflict = findConflict(doctorId, appointmentAt, excludeAppointmentId);
        AvailabilityCheckDto dto = new AvailabilityCheckDto();
        dto.setAvailable(conflict == null); dto.setConflictingAppointmentId(conflict == null ? null : conflict.getId());
        return dto;
    }

    public Cita getEntity(String id) {
        try { return citas.findById(UUID.fromString(id)).orElseThrow(() -> ApiException.notFound("La cita no existe.")); }
        catch (IllegalArgumentException ex) { throw ApiException.notFound("La cita no existe."); }
    }
    @Transactional
    public AppointmentDto create(AppointmentDto dto, AuthenticatedUser actor) {
        validate(dto, null); Cita entity = new Cita(); entity.setId(UUID.randomUUID()); applyInput(entity, dto);
        Cita saved = citas.save(entity);
        notifications.notifyAppointment(saved.getPatientId(), saved.getId(), NotificationType.APPOINTMENT_CREATED);
        return toDto(saved);
    }

    @Transactional
    public AppointmentDto update(String id, AppointmentDto dto) {
        Cita entity = getEntity(id); validate(dto, entity.getId());
        NotificationType type = notificationTypeForUpdate(entity.getStatusId(), dto.getStatusId());
        applyInput(entity, dto);
        Cita saved = citas.save(entity);
        notifications.notifyAppointment(saved.getPatientId(), saved.getId(), type);
        return toDto(saved);
    }
    @Transactional
    public AppointmentDto updateStatus(String id, String status) {
        Cita entity = getEntity(id);
        AppointmentStatus target = statuses.findByNameIgnoreCase(status)
                .orElseThrow(() -> ApiException.badRequest("Selecciona un estado válido."));
        if (target.getId().equals(entity.getStatusId())) return toDto(entity);
        if (isBlocking(target)) {
            lockDoctor(entity.getDoctorId());
            assertSlotAvailable(entity.getDoctorId(), entity.getAppointmentAt(), entity.getId());
        }
        entity.setStatusId(target.getId());
        Cita saved = citas.save(entity);
        notifications.notifyAppointment(saved.getPatientId(), saved.getId(), notificationTypeForStatus(target.getName()));
        return toDto(saved);
    }
    public void delete(String id) { citas.delete(getEntity(id)); }

    private List<Cita> findByDateEntities(LocalDate date) {
        OffsetDateTime from = date.atStartOfDay().atOffset(ZoneOffset.UTC);
        return citas.findByAppointmentAtGreaterThanEqualAndAppointmentAtLessThan(from, from.plusDays(1));
    }

    private void validateOptionalRange(OffsetDateTime from, OffsetDateTime to) {
        if (from != null && to != null && !from.isBefore(to)) {
            throw ApiException.badRequest("from debe ser anterior a to.");
        }
    }

    private void validateRequiredRange(OffsetDateTime from, OffsetDateTime to) {
        if (from == null || to == null) throw ApiException.badRequest("from y to son obligatorios.");
        validateOptionalRange(from, to);
    }

    private void ensureDoctorExists(String doctorId) {
        if (doctorId == null || !doctors.existsById(doctorId)) throw ApiException.badRequest("Selecciona un doctor válido.");
    }

    private void lockDoctor(String doctorId) {
        doctors.findByIdForScheduling(doctorId)
                .orElseThrow(() -> ApiException.badRequest("Selecciona un doctor válido."));
    }

    private boolean isBlocking(AppointmentStatus status) {
        return status != null && status.getName() != null && BLOCKING_STATUS_NAMES.contains(status.getName().toLowerCase(java.util.Locale.ROOT));
    }

    private void assertSlotAvailable(String doctorId, OffsetDateTime appointmentAt, UUID excludeAppointmentId) {
        Cita conflict = findConflict(doctorId, appointmentAt, excludeAppointmentId);
        if (conflict != null) throw ApiException.conflict("El odontólogo ya tiene una cita en ese horario.");
    }

    private Cita findConflict(String doctorId, OffsetDateTime appointmentAt, UUID excludeAppointmentId) {
        return citas.findBlockingAtSlot(doctorId, appointmentAt, excludeAppointmentId, BLOCKING_STATUS_NAMES)
                .stream().findFirst().orElse(null);
    }

    private Map<String, String> patientNames(List<Cita> appointments) {
        Map<String, String> names = new HashMap<>();
        patients.findAllById(appointments.stream().map(Cita::getPatientId).distinct().toList())
                .forEach(patient -> names.put(patient.getId(), (patient.getNames() + " " + patient.getSurnames()).trim()));
        return names;
    }

    private Map<String, String> doctorNames(List<Cita> appointments) {
        Map<String, String> names = new HashMap<>();
        doctors.findAllById(appointments.stream().map(Cita::getDoctorId).distinct().toList())
                .forEach(doctor -> names.put(doctor.getId(), (doctor.getNames() + " " + doctor.getSurnames()).trim()));
        return names;
    }

    private Map<Short, String> typeNames() {
        Map<Short, String> names = new HashMap<>();
        types.findAll().forEach(type -> names.put(type.getId(), type.getName()));
        return names;
    }

    private Map<Short, String> priorityNames() {
        Map<Short, String> names = new HashMap<>();
        priorities.findAll().forEach(priority -> names.put(priority.getId(), priority.getName()));
        return names;
    }

    private Map<Short, String> statusNames() {
        Map<Short, String> names = new HashMap<>();
        statuses.findAll().forEach(status -> names.put(status.getId(), status.getName()));
        return names;
    }

    private CalendarAppointmentDto calendarDto(Cita appointment, Map<String, String> patientNames,
                                               Map<String, String> doctorNames, Map<Short, String> typeNames,
                                               Map<Short, String> priorityNames, Map<Short, String> statusNames) {
        CalendarAppointmentDto dto = new CalendarAppointmentDto();
        dto.setAppointmentId(appointment.getId()); dto.setAppointmentAt(appointment.getAppointmentAt());
        dto.setPatientId(appointment.getPatientId()); dto.setPatientName(patientNames.get(appointment.getPatientId()));
        dto.setDoctorId(appointment.getDoctorId()); dto.setDoctorName(doctorNames.get(appointment.getDoctorId()));
        dto.setAppointmentType(typeNames.get(appointment.getAppointmentTypeId())); dto.setPriority(priorityNames.get(appointment.getPriorityId()));
        dto.setStatus(statusNames.get(appointment.getStatusId())); dto.setNotes(appointment.getNotes());
        return dto;
    }

    private OccupiedSlotDto occupiedSlot(Cita appointment, String status) {
        OccupiedSlotDto dto = new OccupiedSlotDto();
        dto.setAppointmentId(appointment.getId()); dto.setAppointmentAt(appointment.getAppointmentAt()); dto.setStatus(status);
        return dto;
    }

    private void validate(AppointmentDto dto, UUID excludeAppointmentId) {
        if (dto.getPatientId() == null || !patients.existsById(dto.getPatientId())) throw ApiException.badRequest("Selecciona un paciente válido.");
        if (dto.getDoctorId() == null) throw ApiException.badRequest("Selecciona un doctor válido.");
        lockDoctor(dto.getDoctorId());
        if (dto.getAppointmentTypeId() == null || !types.existsById(dto.getAppointmentTypeId())) throw ApiException.badRequest("Selecciona un tipo de cita válido.");
        if (dto.getPriorityId() == null || !priorities.existsById(dto.getPriorityId())) throw ApiException.badRequest("Selecciona una prioridad válida.");
        if (dto.getAppointmentAt() == null) throw ApiException.badRequest("La fecha y hora de la cita es obligatoria.");
        AppointmentStatus status = dto.getStatusId() == null ? null : statuses.findById(dto.getStatusId()).orElse(null);
        if (status == null) throw ApiException.badRequest("Selecciona un estado válido.");
        if (isBlocking(status)) assertSlotAvailable(dto.getDoctorId(), dto.getAppointmentAt(), excludeAppointmentId);
    }
    private void applyInput(Cita e, AppointmentDto d) {
        e.setPatientId(d.getPatientId()); e.setDoctorId(d.getDoctorId()); e.setAppointmentTypeId(d.getAppointmentTypeId());
        e.setPriorityId(d.getPriorityId()); e.setStatusId(d.getStatusId()); e.setAppointmentAt(d.getAppointmentAt()); e.setNotes(d.getNotes());
    }

    private NotificationType notificationTypeForUpdate(Short previousStatusId, Short nextStatusId) {
        if (previousStatusId.equals(nextStatusId)) return NotificationType.APPOINTMENT_UPDATED;
        return statuses.findById(nextStatusId)
                .map(status -> notificationTypeForStatus(status.getName()))
                .orElse(NotificationType.APPOINTMENT_UPDATED);
    }

    private NotificationType notificationTypeForStatus(String status) {
        if ("Cancelada".equalsIgnoreCase(status)) return NotificationType.APPOINTMENT_CANCELLED;
        if ("Confirmada".equalsIgnoreCase(status)) return NotificationType.APPOINTMENT_CONFIRMED;
        return NotificationType.APPOINTMENT_UPDATED;
    }
    private AppointmentDto toDto(Cita e) {
        AppointmentDto d = new AppointmentDto(); d.setId(e.getId().toString()); d.setPatientId(e.getPatientId()); d.setDoctorId(e.getDoctorId());
        d.setAppointmentTypeId(e.getAppointmentTypeId()); d.setPriorityId(e.getPriorityId()); d.setStatusId(e.getStatusId()); d.setAppointmentAt(e.getAppointmentAt()); d.setNotes(e.getNotes()); return d;
    }
}
