package com.ortos.api.modules.appointments;

import com.ortos.api.modules.patients.PacienteRepository;
import com.ortos.api.modules.staff.MedicoRepository;
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
    private AppointmentService service;

    @BeforeEach
    void setUp() {
        citas = mock(CitaRepository.class);
        patients = mock(PacienteRepository.class);
        doctors = mock(MedicoRepository.class);
        AppointmentTypeRepository types = mock(AppointmentTypeRepository.class);
        AppointmentPriorityRepository priorities = mock(AppointmentPriorityRepository.class);
        AppointmentStatusRepository statuses = mock(AppointmentStatusRepository.class);
        service = new AppointmentService(citas, patients, doctors, types, priorities, statuses);

        when(patients.existsById("patient-1")).thenReturn(true);
        when(doctors.existsById("doctor-1")).thenReturn(true);
        when(types.existsById((short) 1)).thenReturn(true);
        when(priorities.existsById((short) 1)).thenReturn(true);
        when(statuses.existsById((short) 1)).thenReturn(true);
        when(citas.save(any(Cita.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createsValidAppointment() {
        AppointmentDto result = service.create(validDto(), null);

        assertEquals("patient-1", result.getPatientId());
        assertEquals("doctor-1", result.getDoctorId());
        assertEquals((short) 1, result.getStatusId());
        verify(citas).save(any(Cita.class));
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
