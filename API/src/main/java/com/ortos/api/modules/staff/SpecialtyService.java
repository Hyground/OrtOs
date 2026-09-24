package com.ortos.api.modules.staff;

import com.ortos.api.shared.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
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

    @Transactional
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

    @Transactional
    public SpecialtyDto update(String id, SpecialtyDto dto) {
        validate(dto);
        Especialidad entity = getEntity(id);
        if (especialidadRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw ApiException.conflict("Ya existe una especialidad con ese nombre.");
        }
        if (!entity.getName().equals(dto.getName())
                && medicoRepository.countBySpecialtyIgnoreCase(entity.getName()) > 0) {
            throw ApiException.conflict("Reasigna los médicos antes de renombrar su especialidad.");
        }
        entity.setName(dto.getName().trim());
        entity.setDescription(dto.getDescription());
        especialidadRepository.save(entity);
        return toDto(entity);
    }

    @Transactional
    public void delete(String id) {
        Especialidad entity = getEntity(id);
        if (medicoRepository.countBySpecialtyIgnoreCase(entity.getName()) > 0) {
            throw ApiException.conflict("Reasigna los médicos antes de eliminar su especialidad.");
        }
        especialidadRepository.deleteById(id);
    }

    private void validate(SpecialtyDto dto) {
        dto.setName(StaffValidation.text(dto.getName(), "name", true));
        dto.setDescription(StaffValidation.text(dto.getDescription(), "description", false));
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
