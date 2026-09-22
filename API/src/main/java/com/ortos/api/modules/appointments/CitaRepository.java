package com.ortos.api.modules.appointments;

import com.ortos.api.modules.appointments.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CitaRepository extends JpaRepository<Cita, String> {
    List<Cita> findByPatientId(String patientId);
    boolean existsByPatientId(String patientId);
    Optional<Cita> findFirstByPatientIdOrderByDateDesc(String patientId);
    long countByTreatmentIgnoreCase(String treatment);
}
