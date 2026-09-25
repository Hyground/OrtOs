package com.ortos.api.modules.appointments;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppointmentStatusRepository extends JpaRepository<AppointmentStatus, Short> {
    Optional<AppointmentStatus> findByNameIgnoreCase(String name);
}
