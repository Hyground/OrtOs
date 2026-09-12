package com.ortos.api.service;

import com.ortos.api.dto.PatientDto;
import com.ortos.api.entity.Cita;
import com.ortos.api.entity.Paciente;
import com.ortos.api.exception.ApiException;
import com.ortos.api.repository.CitaRepository;
import com.ortos.api.repository.PacienteRepository;
import com.ortos.api.repository.PagoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class PatientService {

    private final PacienteRepository pacienteRepository;
    private final CitaRepository citaRepository;
    private final PagoRepository pagoRepository;

    public PatientService(PacienteRepository pacienteRepository, CitaRepository citaRepository, PagoRepository pagoRepository) {
        this.pacienteRepository = pacienteRepository;
        this.citaRepository = citaRepository;
        this.pagoRepository = pagoRepository;
    }

    public List<PatientDto> findAll() {
        return pacienteRepository.findAll().stream().map(this::toDto).toList();
    }

    public PatientDto findById(String id) {
        return toDto(getEntity(id));
    }

    public Paciente getEntity(String id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("El paciente no existe."));
    }

    public PatientDto create(PatientDto dto) {
        validate(dto);
        if (dto.getDpi() != null && !dto.getDpi().isBlank() && pacienteRepository.existsByDpi(dto.getDpi())) {
            throw ApiException.conflict("Ya existe un paciente con ese DPI.");
        }
        Paciente entity = new Paciente();
        entity.setId(UUID.randomUUID().toString());
        applyInput(entity, dto);
        entity.setFolio(nextFolio());
        entity.setCreatedAt(LocalDateTime.now());
        pacienteRepository.save(entity);
        return toDto(entity);
    }

    public PatientDto update(String id, PatientDto dto) {
        validate(dto);
        Paciente entity = getEntity(id);
        if (dto.getDpi() != null && !dto.getDpi().isBlank()
                && pacienteRepository.existsByDpiAndIdNot(dto.getDpi(), id)) {
            throw ApiException.conflict("Ya existe un paciente con ese DPI.");
        }
        applyInput(entity, dto);
        pacienteRepository.save(entity);
        return toDto(entity);
    }

    public void delete(String id) {
        getEntity(id);
        if (citaRepository.existsByPatientId(id) || pagoRepository.existsByPatientId(id)) {
            throw ApiException.conflict(
                    "Este paciente tiene citas o pagos asociados. Puedes cambiar su estado a Inactivo al editarlo.");
        }
        pacienteRepository.deleteById(id);
    }

    private void validate(PatientDto dto) {
        if (dto.getNames() == null || dto.getNames().isBlank()) {
            throw ApiException.badRequest("Ingresa el nombre del paciente.");
        }
        if (dto.getSurnames() == null || dto.getSurnames().isBlank()) {
            throw ApiException.badRequest("Ingresa los apellidos del paciente.");
        }
    }

    private void applyInput(Paciente entity, PatientDto dto) {
        entity.setNames(dto.getNames().trim());
        entity.setSurnames(dto.getSurnames().trim());
        entity.setDpi(dto.getDpi());
        entity.setPhone(dto.getPhone());
        entity.setSecondaryPhone(dto.getSecondaryPhone());
        entity.setEmail(dto.getEmail());
        entity.setBirthDate(dto.getBirthDate() != null && !dto.getBirthDate().isBlank() ? LocalDate.parse(dto.getBirthDate()) : null);
        entity.setGender(dto.getGender());
        entity.setMaritalStatus(dto.getMaritalStatus());
        entity.setOccupation(dto.getOccupation());
        entity.setDepartment(dto.getDepartment());
        entity.setMunicipality(dto.getMunicipality());
        entity.setAddress(dto.getAddress());
        entity.setReference(dto.getReference());
        entity.setBloodGroup(dto.getBloodGroup());
        entity.setAllergies(dto.getAllergies());
        entity.setDiseases(dto.getDiseases());
        entity.setMedications(dto.isMedications());
        entity.setSmoker(dto.isSmoker());
        entity.setNotes(dto.getNotes());
        entity.setPhoto(dto.getPhoto());
        entity.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? "Activo" : dto.getStatus());
    }

    private String nextFolio() {
        long consecutive = pacienteRepository.count() + 1;
        return "EXP-" + LocalDate.now().getYear() + "-" + String.format("%05d", consecutive);
    }

    private PatientDto toDto(Paciente entity) {
        PatientDto dto = new PatientDto();
        dto.setId(entity.getId());
        dto.setNames(entity.getNames());
        dto.setSurnames(entity.getSurnames());
        dto.setDpi(entity.getDpi());
        dto.setPhone(entity.getPhone());
        dto.setSecondaryPhone(entity.getSecondaryPhone());
        dto.setEmail(entity.getEmail());
        dto.setBirthDate(entity.getBirthDate() != null ? entity.getBirthDate().toString() : null);
        dto.setGender(entity.getGender());
        dto.setMaritalStatus(entity.getMaritalStatus());
        dto.setOccupation(entity.getOccupation());
        dto.setDepartment(entity.getDepartment());
        dto.setMunicipality(entity.getMunicipality());
        dto.setAddress(entity.getAddress());
        dto.setReference(entity.getReference());
        dto.setBloodGroup(entity.getBloodGroup());
        dto.setAllergies(entity.getAllergies());
        dto.setDiseases(entity.getDiseases());
        dto.setMedications(entity.isMedications());
        dto.setSmoker(entity.isSmoker());
        dto.setNotes(entity.getNotes());
        dto.setPhoto(entity.getPhoto());
        dto.setStatus(entity.getStatus());
        dto.setName((entity.getNames() + " " + entity.getSurnames()).trim());
        dto.setFolio(entity.getFolio());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toLocalDate().toString() : null);
        dto.setAge(computeAge(entity.getBirthDate()));

        List<Cita> citas = citaRepository.findByPatientId(entity.getId());
        dto.setLastAppointment(citas.stream()
                .map(Cita::getDate)
                .filter(java.util.Objects::nonNull)
                .max(Comparator.naturalOrder())
                .map(LocalDate::toString)
                .orElse(null));
        dto.setTreatment(citas.stream()
                .filter(c -> c.getDate() != null)
                .max(Comparator.comparing(Cita::getDate))
                .map(Cita::getTreatment)
                .orElse(null));

        BigDecimal balance = pagoRepository.findByPatientIdAndStatus(entity.getId(), "Pendiente").stream()
                .map(p -> p.getAmount() == null ? BigDecimal.ZERO : p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setBalance(balance.doubleValue());

        return dto;
    }

    private Integer computeAge(LocalDate birthDate) {
        if (birthDate == null) return null;
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}
