package com.ortos.api.modules.finance;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_plan_charges")
@IdClass(PaymentPlanCharge.Key.class)
@Getter @Setter
public class PaymentPlanCharge {
    @Id @Column(name = "payment_plan_id") private String paymentPlanId;
    @Id @Column(name = "charge_id") private String chargeId;
    @Column(name = "financed_amount", nullable = false, precision = 12, scale = 2) private BigDecimal financedAmount;

    @Getter @Setter @NoArgsConstructor @EqualsAndHashCode
    public static class Key implements Serializable {
        private String paymentPlanId;
        private String chargeId;
    }
}
