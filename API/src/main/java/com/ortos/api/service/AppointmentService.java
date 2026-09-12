package com.ortos.api.service;

import com.ortos.api.dto.AppointmentDto;
import com.ortos.api.entity.Cita;
import com.ortos.api.exception.ApiException;
import com.ortos.api.repository.CitaRepository;
import com.ortos.api.repository.PacienteRepository;
import com.ortos.api.security.AuthenticatedUser;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private static final DateTimeFormatter TS = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public AppointmentService(CitaRepository citaRepository, PacienteRepository pacienteRepository) {
        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
    }

    public List<AppointmentDto> findAll() {
        return citaRepository.findAll().stream().map(this::toDto).toList();
    }

    public AppointmentDto findById(String id) {
        return toDto(getEntity(id));
    }

    public Cita getEntity(String id) {
        return citaRepository.findById(id).orElseThrow(() -> ApiException.notFound("La cita no existe."));
    }

    public AppointmentDto create(AppointmentDto dto, AuthenticatedUser actor) {
        validate(dto);
        Cita entity = new Cita();
        entity.setId(UUID.randomUUID().toString());
        applyInput(entity, dto);
        entity.setFechaCreacion(LocalDateTime.now());
        entity.setCreadaPor(actor != null ? actor.id() : null);
        citaRepository.save(entity);
        return toDto(entity);
    }

    public AppointmentDto update(String id, AppointmentDto dto) {
        validate(dto);
        Cita entity = getEntity(id);
        applyInput(entity, dto);
        citaRepository.save(entity);
        return toDto(entity);
    }

    public AppointmentDto updateStatus(String id, String status) {
        Cita entity = getEntity(id);
        entity.setStatus(status);
        citaRepository.save(entity);
        return toDto(entity);
    }

    public void delete(String id) {
        getEntity(id);
        citaRepository.deleteById(id);
    }

    private void validate(AppointmentDto dto) {
        if (dto.getPatientId() == null || !pacienteRepository.existsById(dto.getPatientId())) {
            throw ApiException.badRequest("Selecciona un paciente válido.");
        }
        if (dto.getDate() == null || dto.getDate().isBlank()) {
            throw ApiException.badRequest("Selecciona la fecha de la cita.");
        }
    }

    private void applyInput(Cita entity, AppointmentDto dto) {
        entity.setPatientId(dto.getPatientId());
        entity.setDentist(dto.getDentist());
        entity.setDate(LocalDate.parse(dto.getDate()));
        entity.setTime(dto.getTime());
        entity.setDuration(dto.getDuration());
        entity.setChair(dto.getChair());
        entity.setTreatment(dto.getTreatment());
        entity.setType(dto.getType());
        entity.setPriority(dto.getPriority());
        entity.setReminder(dto.getReminder());
        entity.setReason(dto.getReason());
        entity.setNotes(dto.getNotes());
        entity.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? "Pendiente" : dto.getStatus());
    }

    private AppointmentDto toDto(Cita entity) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(entity.getId());
        dto.setPatientId(entity.getPatientId());
        dto.setDentist(entity.getDentist());
        dto.setDate(entity.getDate() != null ? entity.getDate().toString() : null);
        dto.setTime(entity.getTime());
        dto.setDuration(entity.getDuration());
        dto.setChair(entity.getChair());
        dto.setTreatment(entity.getTreatment());
        dto.setType(entity.getType());
        dto.setPriority(entity.getPriority());
        dto.setReminder(entity.getReminder());
        dto.setReason(entity.getReason());
        dto.setNotes(entity.getNotes());
        dto.setStatus(entity.getStatus());
        dto.setFechaCreacion(entity.getFechaCreacion() != null ? entity.getFechaCreacion().format(TS) : null);
        dto.setCreadaPor(entity.getCreadaPor());
        return dto;
    }
}
