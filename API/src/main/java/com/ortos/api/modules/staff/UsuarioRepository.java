package com.ortos.api.modules.staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, String id);
    boolean existsByEmailIgnoreCase(String email);

    // Serializes account creation even when the table is empty, across API instances.
    @Modifying
    @Query(value = "LOCK TABLE public.usuarios IN SHARE ROW EXCLUSIVE MODE", nativeQuery = true)
    void lockAccountWrites();

    @Query(value = "SELECT EXISTS (SELECT 1 FROM public.pacientes WHERE id = :id)", nativeQuery = true)
    boolean patientExists(@Param("id") String id);

    long countByRoleAndActiveTrue(String role);
}
