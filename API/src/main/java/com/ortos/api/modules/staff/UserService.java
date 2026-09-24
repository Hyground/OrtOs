package com.ortos.api.modules.staff;

import com.ortos.api.shared.exception.ApiException;
import com.ortos.api.shared.security.AuthenticatedUser;
import com.ortos.api.shared.security.AccessGuard;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.nio.charset.StandardCharsets;

@Service
@Transactional(readOnly = true)
public class UserService {

    private static final Set<String> ROLES = Set.of("admin", "odontologo", "asistente", "paciente");

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final MedicoRepository medicoRepository;

    public UserService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                       MedicoRepository medicoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.medicoRepository = medicoRepository;
    }

    public List<UserDto> findAll() {
        return usuarioRepository.findAll().stream().map(this::toDto).toList();
    }

    public UserDto findById(String id) {
        return toDto(getEntity(id));
    }

    private Usuario getEntity(String id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("El usuario no existe."));
    }

    @Transactional
    public UserDto create(UserSaveRequest req, AuthenticatedUser actor) {
        usuarioRepository.lockAccountWrites();
        if (actor == null && usuarioRepository.count() == 0) {
            if (!"admin".equals(req.getRole()) || !req.isActive()) {
                throw ApiException.badRequest("El primer usuario debe ser un administrador activo.");
            }
        } else {
            AccessGuard.requireAdmin(actor);
        }
        validateCommon(req, null);
        validatePassword(req.getPassword());
        Usuario entity = new Usuario();
        entity.setId(UUID.randomUUID().toString());
        applyInput(entity, req);
        entity.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        entity.setFechaCreacion(LocalDateTime.now());
        usuarioRepository.save(entity);
        return toDto(entity);
    }

    @Transactional
    public UserDto update(String id, UserSaveRequest req, AuthenticatedUser actor) {
        AccessGuard.requireAdmin(actor);
        usuarioRepository.lockAccountWrites();
        validateCommon(req, id);
        Usuario entity = usuarioRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("El usuario ya no existe."));
        if (actor != null && actor.id().equals(id) && (!req.isActive() || !"admin".equals(req.getRole()))) {
            throw ApiException.badRequest("No puedes desactivar tu cuenta ni quitarte el rol de administrador.");
        }
        if (!req.isActive() || !"admin".equals(req.getRole())) {
            requireAnotherAdmin(entity);
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            validatePassword(req.getPassword());
            entity.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }
        applyInput(entity, req);
        usuarioRepository.save(entity);
        return toDto(entity);
    }

    @Transactional
    public void delete(String id, AuthenticatedUser actor) {
        AccessGuard.requireAdmin(actor);
        usuarioRepository.lockAccountWrites();
        if (actor != null && actor.id().equals(id)) {
            throw ApiException.badRequest("No puedes eliminar tu propia cuenta.");
        }
        requireAnotherAdmin(getEntity(id));
        usuarioRepository.deleteById(id);
    }

    private void requireAnotherAdmin(Usuario entity) {
        if (entity.isActive() && "admin".equals(entity.getRole())
                && usuarioRepository.countByRoleAndActiveTrue("admin") <= 1) {
            throw ApiException.conflict("Debe conservarse al menos un administrador activo.");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank() || password.length() < 8
                || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw ApiException.badRequest("La contraseña debe tener al menos 8 caracteres y como máximo 72 bytes UTF-8.");
        }
    }

    private void validateCommon(UserSaveRequest req, String selfId) {
        req.setDisplayName(StaffValidation.text(req.getDisplayName(), "displayName", true));
        req.setEmail(StaffValidation.email(req.getEmail(), true));
        if (req.getRole() == null || !ROLES.contains(req.getRole())) {
            throw ApiException.badRequest("Selecciona un rol válido.");
        }
        boolean emailTaken = selfId == null
                ? usuarioRepository.existsByEmailIgnoreCase(req.getEmail())
                : usuarioRepository.existsByEmailIgnoreCaseAndIdNot(req.getEmail(), selfId);
        if (emailTaken) {
            throw ApiException.conflict("Ese correo ya está registrado.");
        }
        req.setMedicoId(StaffValidation.text(req.getMedicoId(), "medicoId", 36, false));
        req.setPatientId(StaffValidation.text(req.getPatientId(), "patientId", 36, false));
        if (req.getMedicoId() != null
                && (!"odontologo".equals(req.getRole()) || !medicoRepository.existsById(req.getMedicoId()))) {
            throw ApiException.badRequest("medicoId debe identificar un médico existente y requiere el rol odontologo.");
        }
        if (req.getPatientId() != null
                && (!"paciente".equals(req.getRole()) || !usuarioRepository.patientExists(req.getPatientId()))) {
            throw ApiException.badRequest("patientId debe identificar un paciente existente y requiere el rol paciente.");
        }
    }

    private void applyInput(Usuario entity, UserSaveRequest req) {
        entity.setDisplayName(req.getDisplayName().trim());
        entity.setEmail(req.getEmail());
        entity.setRole(req.getRole());
        entity.setActive(req.isActive());
        entity.setMedicoId("odontologo".equals(req.getRole()) ? req.getMedicoId() : null);
        entity.setPatientId("paciente".equals(req.getRole()) ? req.getPatientId() : null);
    }

    private UserDto toDto(Usuario entity) {
        UserDto dto = new UserDto();
        dto.setId(entity.getId());
        dto.setDisplayName(entity.getDisplayName());
        dto.setEmail(entity.getEmail());
        dto.setRole(entity.getRole());
        dto.setActive(entity.isActive());
        dto.setMedicoId(entity.getMedicoId());
        dto.setPatientId(entity.getPatientId());
        return dto;
    }
}
