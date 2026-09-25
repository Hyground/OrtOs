package com.ortos.api.modules.appointments;

import com.ortos.api.modules.appointments.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface CitaRepository extends JpaRepository<Cita, UUID> {
    List<Cita> findByPatientId(String patientId);
    boolean existsByPatientId(String patientId);
    List<Cita> findByDoctorId(String doctorId);
    List<Cita> findByAppointmentAtGreaterThanEqualAndAppointmentAtLessThan(OffsetDateTime from, OffsetDateTime to);

    default long countByTreatmentIgnoreCase(String treatment) {
        return 0;
    }
}
