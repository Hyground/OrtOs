package com.ortos.api.modules.finance;
import lombok.Getter; import lombok.Setter; import java.math.BigDecimal;
@Getter @Setter
public class InstallmentDto { private String id; private Integer number; private BigDecimal amount; private String dueDate; private BigDecimal paidAmount; private String status; }
