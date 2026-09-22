package com.ortos.api.modules.finance;

import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal;
@Getter @Setter
public class ChargeDto {
    private String id; private String patientId; private String appointmentId; private String treatmentId;
    private String description; private BigDecimal quantity; private BigDecimal unitPrice; private BigDecimal subtotal;
    private BigDecimal paid; private BigDecimal balance; private String status; private String createdAt;
}
