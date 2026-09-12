package com.ortos.api.service;

import com.ortos.api.dto.ServiceDto;
import com.ortos.api.entity.Tratamiento;
import com.ortos.api.exception.ApiException;
import com.ortos.api.repository.CitaRepository;
import com.ortos.api.repository.TratamientoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ServiceCatalogService {

    private final TratamientoRepository tratamientoRepository;
    private final CitaRepository citaRepository;

    public ServiceCatalogService(TratamientoRepository tratamientoRepository, CitaRepository citaRepository) {
        this.tratamientoRepository = tratamientoRepository;
        this.citaRepository = citaRepository;
    }

    public List<ServiceDto> findAll() {
        return tratamientoRepository.findAll().stream().map(this::toDto).toList();
    }

    public ServiceDto findById(String id) {
        return toDto(getEntity(id));
    }

    private Tratamiento getEntity(String id) {
        return tratamientoRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("El tratamiento no existe."));
    }

    public ServiceDto create(ServiceDto dto) {
        validate(dto);
        Tratamiento entity = new Tratamiento();
        entity.setId(UUID.randomUUID().toString());
        applyInput(entity, dto);
        tratamientoRepository.save(entity);
        return toDto(entity);
    }

    public ServiceDto update(String id, ServiceDto dto) {
        validate(dto);
        Tratamiento entity = getEntity(id);
        applyInput(entity, dto);
        tratamientoRepository.save(entity);
        return toDto(entity);
    }

    public void delete(String id) {
        getEntity(id);
        tratamientoRepository.deleteById(id);
    }

    private void validate(ServiceDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw ApiException.badRequest("Ingresa el nombre del tratamiento.");
        }
    }

    private void applyInput(Tratamiento entity, ServiceDto dto) {
        entity.setName(dto.getName().trim());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setPrice(dto.getPrice());
        entity.setDurationMin(dto.getDurationMin());
        entity.setActive(dto.isActive());
    }

    private ServiceDto toDto(Tratamiento entity) {
        ServiceDto dto = new ServiceDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setCategory(entity.getCategory());
        dto.setPrice(entity.getPrice());
        dto.setDurationMin(entity.getDurationMin());
        dto.setActive(entity.isActive());
        dto.setVecesSolicitado(citaRepository.countByTreatmentIgnoreCase(entity.getName()));
        return dto;
    }
}
