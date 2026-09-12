package com.ortos.api.service;

import com.ortos.api.dto.auth.AuthUserDto;
import com.ortos.api.dto.auth.LoginResponse;
import com.ortos.api.entity.Usuario;
import com.ortos.api.exception.ApiException;
import com.ortos.api.repository.UsuarioRepository;
import com.ortos.api.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.unauthorized("Correo o contraseña incorrectos."));
        if (!usuario.isActive() || !passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw ApiException.unauthorized("Correo o contraseña incorrectos.");
        }
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        return new LoginResponse(jwtService.generateToken(usuario), toAuthUser(usuario));
    }

    public AuthUserDto me(String usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> ApiException.unauthorized("La sesión ya no es válida."));
        if (!usuario.isActive()) {
            throw ApiException.unauthorized("La cuenta no está activa.");
        }
        return toAuthUser(usuario);
    }

    public void requestPasswordReset(String email) {
        usuarioRepository.findByEmailIgnoreCase(email).ifPresent(usuario -> {
            String code = String.format("%06d", random.nextInt(1_000_000));
            usuario.setCodigoRecuperacion(code);
            usuario.setCodigoRecuperacionExpira(LocalDateTime.now().plusMinutes(15));
            usuarioRepository.save(usuario);
            // Sin envío real de correo en este paso: el código queda persistido para soporte manual.
        });
    }

    private AuthUserDto toAuthUser(Usuario usuario) {
        return new AuthUserDto(usuario.getId(), usuario.getEmail(), usuario.getDisplayName(), usuario.getRole(), usuario.getPatientId());
    }
}
