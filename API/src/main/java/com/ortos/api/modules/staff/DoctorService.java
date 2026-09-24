package com.ortos.api.modules.staff;

import com.ortos.api.shared.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
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

    @Transactional
    public DoctorDto create(DoctorDto dto) {
        validate(dto);
        Medico entity = new Medico();
        entity.setId(UUID.randomUUID().toString());
        applyInput(entity, dto);
        medicoRepository.save(entity);
        return toDto(entity);
    }

    @Transactional
    public DoctorDto update(String id, DoctorDto dto) {
        validate(dto);
        Medico entity = getEntity(id);
        applyInput(entity, dto);
        medicoRepository.save(entity);
        return toDto(entity);
    }

    @Transactional
    public void delete(String id) {
        getEntity(id);
        medicoRepository.deleteById(id);
    }

    private void validate(DoctorDto dto) {
        dto.setNames(StaffValidation.text(dto.getNames(), "names", true));
        dto.setSurnames(StaffValidation.text(dto.getSurnames(), "surnames", true));
        dto.setDpi(StaffValidation.text(dto.getDpi(), "dpi", false));
        dto.setSpecialty(StaffValidation.text(dto.getSpecialty(), "specialty", false));
        dto.setPhone(StaffValidation.text(dto.getPhone(), "phone", false));
        dto.setAddress(StaffValidation.text(dto.getAddress(), "address", false));
        dto.setEmail(StaffValidation.email(dto.getEmail(), false));
        dto.setStatus(StaffValidation.text(dto.getStatus(), "status", false));
        if (dto.getStatus() != null && !java.util.Set.of("Activo", "Inactivo").contains(dto.getStatus())) {
            throw ApiException.badRequest("El estado debe ser Activo o Inactivo.");
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
