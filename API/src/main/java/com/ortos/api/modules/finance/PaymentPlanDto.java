package com.ortos.api.modules.finance;
import lombok.Getter; import lombok.Setter; import java.math.BigDecimal; import java.util.List;
@Getter @Setter
public class PaymentPlanDto { private String id; private String patientId; private String name; private BigDecimal totalAmount; private BigDecimal financedAmount; private Integer installmentCount; private String status; private BigDecimal paidAmount; private BigDecimal balance; private List<InstallmentDto> installments; }
