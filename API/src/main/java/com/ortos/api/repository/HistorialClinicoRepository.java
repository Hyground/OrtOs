package com.ortos.api.repository;

import com.ortos.api.entity.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialClinicoRepository extends JpaRepository<HistorialClinico, String> {
    List<HistorialClinico> findByPatientIdOrderByDateDesc(String patientId);
}
