package com.ortos.api.modules.staff;

import com.ortos.api.modules.staff.Usuario;
import com.ortos.api.modules.patients.PacienteRepository;
import com.ortos.api.modules.staff.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.UUID;

@Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "ortos.seed.enabled", havingValue = "true")
public class SeedUsersRunner implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedUsersRunner(UsuarioRepository usuarioRepository, PacienteRepository pacienteRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) return;

        String demoPatientId = pacienteRepository.findAll().stream()
                .min(Comparator.comparing(p -> p.getFolio() == null ? "" : p.getFolio()))
                .map(com.ortos.api.modules.patients.Paciente::getId)
                .orElse(null);

        seed("Administrador OrtOs", "admin@ortos.test", "Admin123", "admin", null);
        seed("Dra. Ana Morales", "odontologo@ortos.test", "Odonto123", "odontologo", null);
        seed("Paciente Demo", "paciente@ortos.test", "Paciente123", "paciente", demoPatientId);
    }

    private void seed(String displayName, String email, String rawPassword, String role, String patientId) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID().toString());
        usuario.setDisplayName(displayName);
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(rawPassword));
        usuario.setRole(role);
        usuario.setActive(true);
        usuario.setPatientId(patientId);
        usuario.setFechaCreacion(LocalDateTime.now());
        usuarioRepository.save(usuario);
    }
}
