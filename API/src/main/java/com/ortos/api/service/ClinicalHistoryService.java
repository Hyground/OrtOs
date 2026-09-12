package com.ortos.api.service;

import com.ortos.api.dto.ClinicalHistoryDto;
import com.ortos.api.entity.HistorialClinico;
import com.ortos.api.exception.ApiException;
import com.ortos.api.repository.HistorialClinicoRepository;
import com.ortos.api.repository.PacienteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ClinicalHistoryService {

    private final HistorialClinicoRepository historialClinicoRepository;
    private final PacienteRepository pacienteRepository;

    public ClinicalHistoryService(HistorialClinicoRepository historialClinicoRepository, PacienteRepository pacienteRepository) {
        this.historialClinicoRepository = historialClinicoRepository;
        this.pacienteRepository = pacienteRepository;
    }

    public List<ClinicalHistoryDto> findByPatient(String patientId) {
        return historialClinicoRepository.findByPatientIdOrderByDateDesc(patientId).stream().map(this::toDto).toList();
    }

    public ClinicalHistoryDto create(ClinicalHistoryDto dto) {
        if (dto.getPatientId() == null || !pacienteRepository.existsById(dto.getPatientId())) {
            throw ApiException.badRequest("Selecciona un paciente válido.");
        }
        HistorialClinico entity = new HistorialClinico();
        entity.setId(UUID.randomUUID().toString());
        entity.setPatientId(dto.getPatientId());
        entity.setDate(dto.getDate() != null && !dto.getDate().isBlank() ? LocalDate.parse(dto.getDate()) : LocalDate.now());
        entity.setTreatment(dto.getTreatment());
        entity.setDentist(dto.getDentist());
        entity.setNotes(dto.getNotes());
        historialClinicoRepository.save(entity);
        return toDto(entity);
    }

    private ClinicalHistoryDto toDto(HistorialClinico entity) {
        ClinicalHistoryDto dto = new ClinicalHistoryDto();
        dto.setId(entity.getId());
        dto.setPatientId(entity.getPatientId());
        dto.setDate(entity.getDate() != null ? entity.getDate().toString() : null);
        dto.setTreatment(entity.getTreatment());
        dto.setDentist(entity.getDentist());
        dto.setNotes(entity.getNotes());
        return dto;
    }
}
