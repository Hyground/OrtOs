package com.ortos.api.modules.finance;
import lombok.Getter; import lombok.Setter; import java.math.BigDecimal; import java.util.List;
@Getter @Setter public class SaleDto { private String id; private String patientId; private String saleDate; private String status; private BigDecimal total; private List<SaleLineDto> lines; private List<String> appointmentIds; private List<ChargeDto> charges; private PaymentDto downPayment; private PaymentPlanDto paymentPlan; }
