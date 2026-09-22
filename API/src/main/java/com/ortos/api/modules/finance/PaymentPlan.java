package com.ortos.api.modules.finance;
import jakarta.persistence.*; import lombok.Getter; import lombok.Setter; import java.math.BigDecimal; import java.time.LocalDateTime;
@Entity @Table(name="payment_plans") @Getter @Setter
public class PaymentPlan { @Id private String id; @Column(name="patient_id", nullable=false) private String patientId; @Column(name="total_amount", nullable=false, precision=12, scale=2) private BigDecimal totalAmount; @Column(name="financed_amount", nullable=false, precision=12, scale=2) private BigDecimal financedAmount; @Column(name="installment_count", nullable=false) private Integer installmentCount; @Column(nullable=false) private String status="Activo"; @Column(name="created_at", nullable=false) private LocalDateTime createdAt; }
