package com.ortos.api.modules.clinical;

import com.ortos.api.modules.clinical.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialClinicoRepository extends JpaRepository<HistorialClinico, String> {
    List<HistorialClinico> findByPatientIdOrderByDateDesc(String patientId);
}
