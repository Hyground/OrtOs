package com.ortos.api.modules.appointments;

import com.ortos.api.modules.patients.PacienteRepository;
import com.ortos.api.modules.staff.MedicoRepository;
import com.ortos.api.modules.staff.Medico;
import com.ortos.api.shared.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AppointmentServiceTest {
    private CitaRepository citas;
    private PacienteRepository patients;
    private MedicoRepository doctors;
    private AppointmentStatusRepository statuses;
    private NotificationService notifications;
    private AppointmentService service;

    @BeforeEach
    void setUp() {
        citas = mock(CitaRepository.class);
        patients = mock(PacienteRepository.class);
        doctors = mock(MedicoRepository.class);
        notifications = mock(NotificationService.class);
        AppointmentTypeRepository types = mock(AppointmentTypeRepository.class);
        AppointmentPriorityRepository priorities = mock(AppointmentPriorityRepository.class);
        statuses = mock(AppointmentStatusRepository.class);
        service = new AppointmentService(citas, patients, doctors, types, priorities, statuses, notifications);

        when(patients.existsById("patient-1")).thenReturn(true);
        when(doctors.existsById("doctor-1")).thenReturn(true);
        Medico doctor = new Medico(); doctor.setId("doctor-1");
        when(doctors.findByIdForScheduling("doctor-1")).thenReturn(Optional.of(doctor));
        when(types.existsById((short) 1)).thenReturn(true);
        when(priorities.existsById((short) 1)).thenReturn(true);
        when(statuses.existsById((short) 1)).thenReturn(true);
        AppointmentStatus scheduled = new AppointmentStatus(); scheduled.setId((short) 1); scheduled.setName("Programada");
        when(statuses.findById((short) 1)).thenReturn(Optional.of(scheduled));
        when(citas.save(any(Cita.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createsValidAppointment() {
        AppointmentDto result = service.create(validDto(), null);

        assertEquals("patient-1", result.getPatientId());
        assertEquals("doctor-1", result.getDoctorId());
        assertEquals((short) 1, result.getStatusId());
        verify(citas).save(any(Cita.class));
        verify(notifications).notifyAppointment(eq("patient-1"), any(), eq(NotificationType.APPOINTMENT_CREATED));
    }

    @Test
    void findsAppointmentById() {
        Cita appointment = appointment();
        when(citas.findById(appointment.getId())).thenReturn(Optional.of(appointment));

        assertEquals(appointment.getId().toString(), service.findById(appointment.getId().toString()).getId());
    }

    @Test
    void updatesAppointment() {
        Cita appointment = appointment();
        when(citas.findById(appointment.getId())).thenReturn(Optional.of(appointment));
        AppointmentDto input = validDto();
        input.setNotes("Actualizada");

        assertEquals("Actualizada", service.update(appointment.getId().toString(), input).getNotes());
        verify(notifications, times(1)).notifyAppointment(eq("patient-1"), eq(appointment.getId()), eq(NotificationType.APPOINTMENT_UPDATED));
    }

    @Test
    void confirmsAppointmentWithoutDuplicatingUpdateNotification() {
        Cita appointment = appointment();
        when(citas.findById(appointment.getId())).thenReturn(Optional.of(appointment));
        AppointmentStatus confirmed = new AppointmentStatus(); confirmed.setId((short) 2); confirmed.setName("Confirmada");
        when(statuses.existsById((short) 2)).thenReturn(true);
        when(statuses.findById((short) 2)).thenReturn(Optional.of(confirmed));
        AppointmentDto input = validDto(); input.setStatusId((short) 2);

        service.update(appointment.getId().toString(), input);

        verify(notifications, times(1)).notifyAppointment("patient-1", appointment.getId(), NotificationType.APPOINTMENT_CONFIRMED);
    }

    @Test
    void cancelsAppointment() {
        Cita appointment = appointment();
        when(citas.findById(appointment.getId())).thenReturn(Optional.of(appointment));
        AppointmentStatus cancelled = new AppointmentStatus(); cancelled.setId((short) 5); cancelled.setName("Cancelada");
        when(statuses.findByNameIgnoreCase("Cancelada")).thenReturn(Optional.of(cancelled));

        service.updateStatus(appointment.getId().toString(), "Cancelada");

        verify(notifications).notifyAppointment("patient-1", appointment.getId(), NotificationType.APPOINTMENT_CANCELLED);
    }

    @Test
    void listsAppointmentsByPatient() {
        when(citas.findByPatientId("patient-1")).thenReturn(List.of(appointment()));

        assertEquals(1, service.findByPatient("patient-1").size());
    }

    @Test
    void listsAppointmentsByDoctor() {
        when(citas.findByDoctorId("doctor-1")).thenReturn(List.of(appointment()));

        assertEquals(1, service.findByDoctor("doctor-1").size());
    }

    @Test
    void filtersAppointmentsByDate() {
        LocalDate date = LocalDate.of(2026, 9, 24);
        when(citas.findByAppointmentAtGreaterThanEqualAndAppointmentAtLessThan(any(), any()))
                .thenReturn(List.of(appointment()));

        assertEquals(1, service.findByDate(date).size());
        ArgumentCaptor<OffsetDateTime> from = ArgumentCaptor.forClass(OffsetDateTime.class);
        verify(citas).findByAppointmentAtGreaterThanEqualAndAppointmentAtLessThan(
                from.capture(), eq(date.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC)));
        assertEquals(date.atStartOfDay().atOffset(ZoneOffset.UTC), from.getValue());
    }

    @Test
    void rejectsUnknownPatient() {
        AppointmentDto dto = validDto();
        dto.setPatientId("missing");

        assertThrows(ApiException.class, () -> service.create(dto, null));
    }

    @Test
    void rejectsUnknownDoctor() {
        AppointmentDto dto = validDto();
        dto.setDoctorId("missing");

        assertThrows(ApiException.class, () -> service.create(dto, null));
    }

    @Test
    void rejectsSecondBlockingAppointmentForSameDoctorAndSlot() {
        when(citas.findBlockingAtSlot(anyString(), any(), any(), any())).thenReturn(List.of(appointment()));

        assertThrows(ApiException.class, () -> service.create(validDto(), null));
        verify(notifications, never()).notifyAppointment(anyString(), any(), any());
    }

    @Test
    void permitsSameSlotForDifferentDoctor() {
        Medico otherDoctor = new Medico(); otherDoctor.setId("doctor-2");
        when(doctors.findByIdForScheduling("doctor-2")).thenReturn(Optional.of(otherDoctor));
        AppointmentDto dto = validDto(); dto.setDoctorId("doctor-2");

        service.create(dto, null);

        verify(citas).save(any(Cita.class));
    }

    @Test
    void permitsSlotHeldByCancelledAppointment() {
        AppointmentStatus cancelled = new AppointmentStatus(); cancelled.setId((short) 5); cancelled.setName("Cancelada");
        when(statuses.findById((short) 5)).thenReturn(Optional.of(cancelled));
        AppointmentDto dto = validDto(); dto.setStatusId((short) 5);

        service.create(dto, null);

        verify(citas).save(any(Cita.class));
        verify(citas, never()).findBlockingAtSlot(anyString(), any(), any(), any());
    }

    @Test
    void rejectsMoveToOccupiedSlotWithoutNotification() {
        Cita existing = appointment();
        when(citas.findById(existing.getId())).thenReturn(Optional.of(existing));
        when(citas.findBlockingAtSlot(anyString(), any(), eq(existing.getId()), any())).thenReturn(List.of(appointment()));
        AppointmentDto dto = validDto(); dto.setAppointmentAt(dto.getAppointmentAt().plusHours(1));

        assertThrows(ApiException.class, () -> service.update(existing.getId().toString(), dto));
        verify(notifications, never()).notifyAppointment(anyString(), any(), any());
    }

    @Test
    void searchesRangeChronologically() {
        OffsetDateTime from = OffsetDateTime.of(2026, 9, 24, 0, 0, 0, 0, ZoneOffset.UTC);
        OffsetDateTime to = from.plusDays(1);
        Cita first = appointment();
        Cita second = appointment(); second.setAppointmentAt(first.getAppointmentAt().plusHours(1));
        when(citas.search("patient-1", "doctor-1", (short) 1, from, to)).thenReturn(List.of(first, second));

        assertEquals(2, service.findAll("patient-1", "doctor-1", (short) 1, null, from, to).size());
        verify(citas).search("patient-1", "doctor-1", (short) 1, from, to);
    }

    @Test
    void reportsAvailabilityForOccupiedAndFreeSlot() {
        Cita conflict = appointment();
        when(citas.findBlockingAtSlot(eq("doctor-1"), eq(conflict.getAppointmentAt()), isNull(), any()))
                .thenReturn(List.of(conflict));

        AvailabilityCheckDto occupied = service.checkAvailability("doctor-1", conflict.getAppointmentAt(), null);
        AvailabilityCheckDto free = service.checkAvailability("doctor-1", conflict.getAppointmentAt().plusHours(1), null);

        assertEquals(false, occupied.isAvailable());
        assertEquals(conflict.getId(), occupied.getConflictingAppointmentId());
        assertEquals(true, free.isAvailable());
    }

    private AppointmentDto validDto() {
        AppointmentDto dto = new AppointmentDto();
        dto.setPatientId("patient-1"); dto.setDoctorId("doctor-1"); dto.setAppointmentTypeId((short) 1);
        dto.setPriorityId((short) 1); dto.setStatusId((short) 1);
        dto.setAppointmentAt(OffsetDateTime.of(2026, 9, 24, 10, 0, 0, 0, ZoneOffset.UTC));
        dto.setNotes("Control");
        return dto;
    }

    private Cita appointment() {
        Cita appointment = new Cita();
        appointment.setId(UUID.randomUUID()); appointment.setPatientId("patient-1"); appointment.setDoctorId("doctor-1");
        appointment.setAppointmentTypeId((short) 1); appointment.setPriorityId((short) 1); appointment.setStatusId((short) 1);
        appointment.setAppointmentAt(OffsetDateTime.of(2026, 9, 24, 10, 0, 0, 0, ZoneOffset.UTC));
        return appointment;
    }
}
