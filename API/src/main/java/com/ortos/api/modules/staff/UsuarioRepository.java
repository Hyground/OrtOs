package com.ortos.api.modules.staff;

import com.ortos.api.modules.staff.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, String id);
    boolean existsByEmailIgnoreCase(String email);
    @org.springframework.data.jpa.repository.Query("select u.id from Usuario u where u.patientId = :patientId")
    Optional<String> findUserIdByPatientId(@org.springframework.data.repository.query.Param("patientId") String patientId);
}
