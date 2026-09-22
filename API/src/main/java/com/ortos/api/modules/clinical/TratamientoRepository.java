package com.ortos.api.modules.clinical;

import com.ortos.api.modules.clinical.Tratamiento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TratamientoRepository extends JpaRepository<Tratamiento, String> {
}
