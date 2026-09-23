package com.ortos.api.modules.finance;
import lombok.Getter; import lombok.Setter; import java.math.BigDecimal;
@Getter @Setter public class SaleLineDto { private String id; private String treatmentId; private String description; private BigDecimal quantity; private BigDecimal unitPrice; private BigDecimal subtotal; }
