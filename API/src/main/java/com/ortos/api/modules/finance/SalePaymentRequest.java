package com.ortos.api.modules.finance;
import lombok.Getter; import lombok.Setter; import java.math.BigDecimal;
@Getter @Setter public class SalePaymentRequest { private BigDecimal amount; private String currency = "GTQ"; private String method; private String reference; private String notes; private boolean receipt; private String date; }
