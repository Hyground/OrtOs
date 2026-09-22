package com.ortos.api.modules.finance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "cargos") @Getter @Setter
public class Cargo {
    @Id private String id;
    @Column(name = "patient_id", nullable = false) private String patientId;
    @Column(name = "appointment_id") private String appointmentId;
    @Column(name = "treatment_id") private String treatmentId;
    @Column(nullable = false) private String description;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal quantity;
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2) private BigDecimal unitPrice;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal subtotal;
    @Column(nullable = false) private String status = "Pendiente";
    @Column(name = "created_at", nullable = false) private LocalDateTime createdAt;
}
