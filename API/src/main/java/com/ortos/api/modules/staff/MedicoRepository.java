package com.ortos.api.modules.staff;

import com.ortos.api.modules.staff.Medico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicoRepository extends JpaRepository<Medico, String> {
    long countBySpecialtyIgnoreCase(String specialty);
}
