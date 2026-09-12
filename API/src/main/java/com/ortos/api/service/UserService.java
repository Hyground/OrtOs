package com.ortos.api.service;

import com.ortos.api.dto.UserDto;
import com.ortos.api.dto.UserSaveRequest;
import com.ortos.api.entity.Usuario;
import com.ortos.api.exception.ApiException;
import com.ortos.api.repository.UsuarioRepository;
import com.ortos.api.security.AuthenticatedUser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Set<String> ROLES = Set.of("admin", "odontologo", "asistente", "paciente");

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDto> findAll() {
        return usuarioRepository.findAll().stream().map(this::toDto).toList();
    }

    public UserDto create(UserSaveRequest req, AuthenticatedUser actor) {
        validateCommon(req, null);
        if (req.getPassword() == null || req.getPassword().length() < 8) {
            throw ApiException.badRequest("La contraseña debe tener al menos 8 caracteres.");
        }
        Usuario entity = new Usuario();
        entity.setId(UUID.randomUUID().toString());
        applyInput(entity, req);
        entity.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        entity.setFechaCreacion(LocalDateTime.now());
        usuarioRepository.save(entity);
        return toDto(entity);
    }

    public UserDto update(String id, UserSaveRequest req, AuthenticatedUser actor) {
        validateCommon(req, id);
        Usuario entity = usuarioRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("El usuario ya no existe."));
        if (actor != null && actor.id().equals(id) && (!req.isActive() || !"admin".equals(req.getRole()))) {
            throw ApiException.badRequest("No puedes desactivar tu cuenta ni quitarte el rol de administrador.");
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            if (req.getPassword().length() < 8) {
                throw ApiException.badRequest("La contraseña debe tener al menos 8 caracteres.");
            }
            entity.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }
        applyInput(entity, req);
        usuarioRepository.save(entity);
        return toDto(entity);
    }

    public void delete(String id, AuthenticatedUser actor) {
        if (actor != null && actor.id().equals(id)) {
            throw ApiException.badRequest("No puedes eliminar tu propia cuenta.");
        }
        if (!usuarioRepository.existsById(id)) {
            throw ApiException.notFound("El usuario ya no existe.");
        }
        usuarioRepository.deleteById(id);
    }

    private void validateCommon(UserSaveRequest req, String selfId) {
        if (req.getDisplayName() == null || req.getDisplayName().isBlank()) {
            throw ApiException.badRequest("Ingresa el nombre del usuario.");
        }
        if (req.getEmail() == null || !EMAIL_PATTERN.matcher(req.getEmail()).matches()) {
            throw ApiException.badRequest("Ingresa un correo válido.");
        }
        if (req.getRole() == null || !ROLES.contains(req.getRole())) {
            throw ApiException.badRequest("Selecciona un rol válido.");
        }
        boolean emailTaken = selfId == null
                ? usuarioRepository.existsByEmailIgnoreCase(req.getEmail())
                : usuarioRepository.existsByEmailIgnoreCaseAndIdNot(req.getEmail(), selfId);
        if (emailTaken) {
            throw ApiException.conflict("Ese correo ya está registrado.");
        }
    }

    private void applyInput(Usuario entity, UserSaveRequest req) {
        entity.setDisplayName(req.getDisplayName().trim());
        entity.setEmail(req.getEmail().trim().toLowerCase());
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
