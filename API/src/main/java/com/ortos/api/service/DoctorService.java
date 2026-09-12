package com.ortos.api.service;

import com.ortos.api.dto.DoctorDto;
import com.ortos.api.entity.Medico;
import com.ortos.api.exception.ApiException;
import com.ortos.api.repository.MedicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DoctorService {

    private final MedicoRepository medicoRepository;

    public DoctorService(MedicoRepository medicoRepository) {
        this.medicoRepository = medicoRepository;
    }

    public List<DoctorDto> findAll() {
        return medicoRepository.findAll().stream().map(this::toDto).toList();
    }

    public DoctorDto findById(String id) {
        return toDto(getEntity(id));
    }

    private Medico getEntity(String id) {
        return medicoRepository.findById(id).orElseThrow(() -> ApiException.notFound("El médico no existe."));
    }

    public DoctorDto create(DoctorDto dto) {
        validate(dto);
        Medico entity = new Medico();
        entity.setId(UUID.randomUUID().toString());
        applyInput(entity, dto);
        medicoRepository.save(entity);
        return toDto(entity);
    }

    public DoctorDto update(String id, DoctorDto dto) {
        validate(dto);
        Medico entity = getEntity(id);
        applyInput(entity, dto);
        medicoRepository.save(entity);
        return toDto(entity);
    }

    public void delete(String id) {
        getEntity(id);
        medicoRepository.deleteById(id);
    }

    private void validate(DoctorDto dto) {
        if (dto.getNames() == null || dto.getNames().isBlank()) {
            throw ApiException.badRequest("Ingresa el nombre del médico.");
        }
    }

    private void applyInput(Medico entity, DoctorDto dto) {
        entity.setNames(dto.getNames().trim());
        entity.setSurnames(dto.getSurnames());
        entity.setDpi(dto.getDpi());
        entity.setSpecialty(dto.getSpecialty());
        entity.setAddress(dto.getAddress());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
        entity.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? "Activo" : dto.getStatus());
        entity.setPhoto(dto.getPhoto());
    }

    private DoctorDto toDto(Medico entity) {
        DoctorDto dto = new DoctorDto();
        dto.setId(entity.getId());
        dto.setNames(entity.getNames());
        dto.setSurnames(entity.getSurnames());
        dto.setDpi(entity.getDpi());
        dto.setSpecialty(entity.getSpecialty());
        dto.setAddress(entity.getAddress());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setStatus(entity.getStatus());
        dto.setPhoto(entity.getPhoto());
        dto.setName((entity.getNames() + " " + (entity.getSurnames() == null ? "" : entity.getSurnames())).trim());
        return dto;
    }
}
