package com.ortos.api.modules.staff;

import com.ortos.api.modules.staff.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface MedicoRepository extends JpaRepository<Medico, String> {
    long countBySpecialtyIgnoreCase(String specialty);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Medico m where m.id = :id")
    Optional<Medico> findByIdForScheduling(@Param("id") String id);
}
