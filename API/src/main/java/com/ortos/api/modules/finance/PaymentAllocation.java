package com.ortos.api.modules.finance;
import jakarta.persistence.*; import lombok.Getter; import lombok.Setter; import java.math.BigDecimal;
@Entity @Table(name = "payment_allocations") @Getter @Setter
public class PaymentAllocation { @Id private String id; @Column(name="payment_id", nullable=false) private String paymentId; @Column(name="charge_id", nullable=false) private String chargeId; @Column(nullable=false, precision=12, scale=2) private BigDecimal amount; }
