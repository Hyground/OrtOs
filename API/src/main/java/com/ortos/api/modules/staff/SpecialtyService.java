package com.ortos.api.modules.staff;

import com.ortos.api.modules.staff.SpecialtyDto;
import com.ortos.api.modules.staff.Especialidad;
import com.ortos.api.shared.exception.ApiException;
import com.ortos.api.modules.staff.EspecialidadRepository;
import com.ortos.api.modules.staff.MedicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SpecialtyService {

    private final EspecialidadRepository especialidadRepository;
    private final MedicoRepository medicoRepository;

    public SpecialtyService(EspecialidadRepository especialidadRepository, MedicoRepository medicoRepository) {
        this.especialidadRepository = especialidadRepository;
        this.medicoRepository = medicoRepository;
    }

    public List<SpecialtyDto> findAll() {
        return especialidadRepository.findAll().stream().map(this::toDto).toList();
    }

    public SpecialtyDto findById(String id) {
        return toDto(getEntity(id));
    }

    private Especialidad getEntity(String id) {
        return especialidadRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("La especialidad no existe."));
    }

    public SpecialtyDto create(SpecialtyDto dto) {
        validate(dto);
        if (especialidadRepository.existsByNameIgnoreCase(dto.getName())) {
            throw ApiException.conflict("Ya existe una especialidad con ese nombre.");
        }
        Especialidad entity = new Especialidad();
        entity.setId(UUID.randomUUID().toString());
        entity.setName(dto.getName().trim());
        entity.setDescription(dto.getDescription());
        especialidadRepository.save(entity);
        return toDto(entity);
    }

    public SpecialtyDto update(String id, SpecialtyDto dto) {
        validate(dto);
        Especialidad entity = getEntity(id);
        if (especialidadRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw ApiException.conflict("Ya existe una especialidad con ese nombre.");
        }
        entity.setName(dto.getName().trim());
        entity.setDescription(dto.getDescription());
        especialidadRepository.save(entity);
        return toDto(entity);
    }

    public void delete(String id) {
        getEntity(id);
        especialidadRepository.deleteById(id);
    }

    private void validate(SpecialtyDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw ApiException.badRequest("Ingresa el nombre de la especialidad.");
        }
    }

    private SpecialtyDto toDto(Especialidad entity) {
        SpecialtyDto dto = new SpecialtyDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setTotalMedicos(medicoRepository.countBySpecialtyIgnoreCase(entity.getName()));
        return dto;
    }
}
