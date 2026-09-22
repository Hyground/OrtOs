package com.ortos.api.modules.staff;

import com.ortos.api.modules.staff.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EspecialidadRepository extends JpaRepository<Especialidad, String> {
    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);
    boolean existsByNameIgnoreCase(String name);
}
