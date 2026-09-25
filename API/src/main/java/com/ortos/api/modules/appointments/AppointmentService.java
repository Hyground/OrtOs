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
import java.util.UUID;

@Service
public class AppointmentService {
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

    public List<AppointmentDto> findAll(String patientId, String doctorId, Short statusId, LocalDate date) {
        List<Cita> result = patientId != null ? citas.findByPatientId(patientId)
                : doctorId != null ? citas.findByDoctorId(doctorId)
                : date != null ? findByDateEntities(date) : citas.findAll();
        return result.stream().filter(a -> statusId == null || statusId.equals(a.getStatusId()))
                .filter(a -> date == null || date.equals(a.getAppointmentAt().toLocalDate())).map(this::toDto).toList();
    }
    public List<AppointmentDto> findByPatient(String patientId) { return citas.findByPatientId(patientId).stream().map(this::toDto).toList(); }
    public List<AppointmentDto> findByDoctor(String doctorId) { return citas.findByDoctorId(doctorId).stream().map(this::toDto).toList(); }
    public List<AppointmentDto> findByDate(LocalDate date) { return findByDateEntities(date).stream().map(this::toDto).toList(); }
    public List<AppointmentType> findTypes() { return types.findAll(); }
    public List<AppointmentPriority> findPriorities() { return priorities.findAll(); }
    public List<AppointmentStatus> findStatuses() { return statuses.findAll(); }
    public AppointmentDto findById(String id) { return toDto(getEntity(id)); }

    public Cita getEntity(String id) {
        try { return citas.findById(UUID.fromString(id)).orElseThrow(() -> ApiException.notFound("La cita no existe.")); }
        catch (IllegalArgumentException ex) { throw ApiException.notFound("La cita no existe."); }
    }
    @Transactional
    public AppointmentDto create(AppointmentDto dto, AuthenticatedUser actor) {
        validate(dto); Cita entity = new Cita(); entity.setId(UUID.randomUUID()); applyInput(entity, dto);
        Cita saved = citas.save(entity);
        notifications.notifyAppointment(saved.getPatientId(), saved.getId(), NotificationType.APPOINTMENT_CREATED);
        return toDto(saved);
    }

    @Transactional
    public AppointmentDto update(String id, AppointmentDto dto) {
        Cita entity = getEntity(id); validate(dto);
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
    private void validate(AppointmentDto dto) {
        if (dto.getPatientId() == null || !patients.existsById(dto.getPatientId())) throw ApiException.badRequest("Selecciona un paciente válido.");
        if (dto.getDoctorId() == null || !doctors.existsById(dto.getDoctorId())) throw ApiException.badRequest("Selecciona un doctor válido.");
        if (dto.getAppointmentTypeId() == null || !types.existsById(dto.getAppointmentTypeId())) throw ApiException.badRequest("Selecciona un tipo de cita válido.");
        if (dto.getPriorityId() == null || !priorities.existsById(dto.getPriorityId())) throw ApiException.badRequest("Selecciona una prioridad válida.");
        if (dto.getStatusId() == null || !statuses.existsById(dto.getStatusId())) throw ApiException.badRequest("Selecciona un estado válido.");
        if (dto.getAppointmentAt() == null) throw ApiException.badRequest("La fecha y hora de la cita es obligatoria.");
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
