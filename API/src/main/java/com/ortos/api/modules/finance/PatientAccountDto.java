package com.ortos.api.modules.finance;

import lombok.Getter; import lombok.Setter; import java.math.BigDecimal; import java.util.List;
@Getter @Setter
public class PatientAccountDto {
    private String patientId; private String appointmentId; private BigDecimal totalCharged; private BigDecimal totalPaid;
    private BigDecimal balance; private String nextPayment; private List<ChargeDto> charges; private List<PaymentDto> payments;
    private List<PaymentPlanDto> plans;
}
