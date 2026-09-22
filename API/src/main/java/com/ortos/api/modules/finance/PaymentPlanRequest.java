package com.ortos.api.modules.finance;
import lombok.Getter; import lombok.Setter; import java.math.BigDecimal;
@Getter @Setter
public class PaymentPlanRequest { private BigDecimal totalAmount; private BigDecimal financedAmount; private Integer installmentCount; private String firstDueDate; }
