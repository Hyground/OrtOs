package com.ortos.api.modules.finance;
import jakarta.persistence.*; import lombok.Getter; import lombok.Setter; import java.math.BigDecimal; import java.time.LocalDate;
@Entity @Table(name="installments") @Getter @Setter
public class Installment { @Id private String id; @Column(name="payment_plan_id", nullable=false) private String paymentPlanId; @Column(name="installment_number", nullable=false) private Integer number; @Column(nullable=false, precision=12, scale=2) private BigDecimal amount; @Column(name="due_date", nullable=false) private LocalDate dueDate; @Column(name="paid_amount", nullable=false, precision=12, scale=2) private BigDecimal paidAmount=BigDecimal.ZERO; @Column(nullable=false) private String status="Pendiente"; }
