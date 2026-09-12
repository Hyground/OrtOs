package com.ortos.api.repository;

import com.ortos.api.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, String> {
    List<Pago> findByPatientId(String patientId);
    boolean existsByPatientId(String patientId);
    Optional<Pago> findFirstByReceiptNumberIsNotNullOrderByReceiptNumberDesc();
    List<Pago> findByPatientIdAndStatus(String patientId, String status);
}
