package com.ortos.api.repository;

import com.ortos.api.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CitaRepository extends JpaRepository<Cita, String> {
    List<Cita> findByPatientId(String patientId);
    boolean existsByPatientId(String patientId);
    Optional<Cita> findFirstByPatientIdOrderByDateDesc(String patientId);
    long countByTreatmentIgnoreCase(String treatment);
}
