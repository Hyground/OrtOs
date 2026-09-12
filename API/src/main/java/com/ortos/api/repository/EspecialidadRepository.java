package com.ortos.api.repository;

import com.ortos.api.entity.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EspecialidadRepository extends JpaRepository<Especialidad, String> {
    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);
    boolean existsByNameIgnoreCase(String name);
}
