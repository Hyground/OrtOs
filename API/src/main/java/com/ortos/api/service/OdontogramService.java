package com.ortos.api.service;

import com.ortos.api.dto.ToothDto;
import com.ortos.api.entity.OdontogramaRegistro;
import com.ortos.api.exception.ApiException;
import com.ortos.api.repository.OdontogramaRepository;
import com.ortos.api.repository.PacienteRepository;
import com.ortos.api.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OdontogramService {

    private static final List<String> SURFACES = List.of("top", "left", "center", "right", "bottom");

    private final OdontogramaRepository odontogramaRepository;
    private final PacienteRepository pacienteRepository;

    public OdontogramService(OdontogramaRepository odontogramaRepository, PacienteRepository pacienteRepository) {
        this.odontogramaRepository = odontogramaRepository;
        this.pacienteRepository = pacienteRepository;
    }

    public Map<String, ToothDto> getChart(String patientId) {
        requirePatient(patientId);
        Map<String, ToothDto> chart = new LinkedHashMap<>();
        for (OdontogramaRegistro row : odontogramaRepository.findByPatientId(patientId)) {
            ToothDto tooth = chart.computeIfAbsent(String.valueOf(row.getToothNumber()), k -> new ToothDto());
            tooth.getFaces().put(row.getSurface(), row.getState());
            if (row.getTreatment() != null) tooth.setTreatment(row.getTreatment());
            if (row.getNotes() != null) tooth.setNotes(row.getNotes());
        }
        return chart;
    }

    @Transactional
    public Map<String, ToothDto> saveChart(String patientId, Map<String, ToothDto> chart, AuthenticatedUser actor) {
        requirePatient(patientId);
        if (chart == null) throw ApiException.badRequest("El odontograma no tiene un formato válido.");
        odontogramaRepository.deleteByPatientId(patientId);
        for (Map.Entry<String, ToothDto> entry : chart.entrySet()) {
            int toothNumber;
            try {
                toothNumber = Integer.parseInt(entry.getKey());
            } catch (NumberFormatException e) {
                throw ApiException.badRequest("El odontograma no tiene un formato válido.");
            }
            ToothDto tooth = entry.getValue();
            for (String surface : SURFACES) {
                String state = tooth.getFaces().getOrDefault(surface, "sinRegistro");
                OdontogramaRegistro row = new OdontogramaRegistro();
                row.setPatientId(patientId);
                row.setToothNumber(toothNumber);
                row.setSurface(surface);
                row.setState(state);
                row.setTreatment(tooth.getTreatment());
                row.setNotes(tooth.getNotes());
                row.setRegistradoPor(actor != null ? actor.id() : null);
                row.setFechaActualizacion(LocalDateTime.now());
                odontogramaRepository.save(row);
            }
        }
        return getChart(patientId);
    }

    private void requirePatient(String patientId) {
        if (!pacienteRepository.existsById(patientId)) {
            throw ApiException.notFound("El paciente no existe.");
        }
    }
}
