package com.ortos.api.modules.patients;

import com.ortos.api.modules.patients.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, String> {
    boolean existsByDpiAndIdNot(String dpi, String id);
    boolean existsByDpi(String dpi);
    Optional<Paciente> findFirstByOrderByCreatedAtAsc();
    long count();
}
