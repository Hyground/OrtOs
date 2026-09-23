package com.ortos.api.modules.finance;
import lombok.Getter; import lombok.Setter; import java.math.BigDecimal; import java.util.List;
@Getter @Setter public class SaleLineRequest { private String treatmentId; private String description; private BigDecimal quantity; private BigDecimal unitPrice; private List<SaleSessionRequest> sessions; }
