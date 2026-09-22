package com.ortos.api.modules.finance;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PaymentAllocationInput { private String chargeId; private BigDecimal amount; }
