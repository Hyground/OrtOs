package com.ortos.api.repository;

import com.ortos.api.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, String> {
    boolean existsByDpiAndIdNot(String dpi, String id);
    boolean existsByDpi(String dpi);
    Optional<Paciente> findFirstByOrderByCreatedAtAsc();
    long count();
}
