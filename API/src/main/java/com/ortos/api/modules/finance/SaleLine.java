package com.ortos.api.modules.finance;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_lines")
@Getter @Setter
public class SaleLine {
    @Id private String id;
    @Column(name = "sale_id", nullable = false) private String saleId;
    @Column(name = "treatment_id") private String treatmentId;
    @Column(nullable = false) private String description;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal quantity;
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2) private BigDecimal unitPrice;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal subtotal;
}
