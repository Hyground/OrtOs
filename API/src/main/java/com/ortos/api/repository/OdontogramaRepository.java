package com.ortos.api.repository;

import com.ortos.api.entity.OdontogramaId;
import com.ortos.api.entity.OdontogramaRegistro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OdontogramaRepository extends JpaRepository<OdontogramaRegistro, OdontogramaId> {
    List<OdontogramaRegistro> findByPatientId(String patientId);
    void deleteByPatientId(String patientId);
}
