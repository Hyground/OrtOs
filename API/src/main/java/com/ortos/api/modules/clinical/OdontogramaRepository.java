package com.ortos.api.modules.clinical;

import com.ortos.api.modules.clinical.OdontogramaId;
import com.ortos.api.modules.clinical.OdontogramaRegistro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OdontogramaRepository extends JpaRepository<OdontogramaRegistro, OdontogramaId> {
    List<OdontogramaRegistro> findByPatientId(String patientId);
    void deleteByPatientId(String patientId);
}
