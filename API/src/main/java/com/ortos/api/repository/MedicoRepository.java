package com.ortos.api.repository;

import com.ortos.api.entity.Medico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicoRepository extends JpaRepository<Medico, String> {
    long countBySpecialtyIgnoreCase(String specialty);
}
