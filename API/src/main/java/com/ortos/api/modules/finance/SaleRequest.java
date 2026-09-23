package com.ortos.api.modules.finance;
import lombok.Getter; import lombok.Setter; import java.util.List;
@Getter @Setter public class SaleRequest { private String patientId; private String saleDate; private List<SaleLineRequest> lines; private SalePaymentRequest downPayment; private SalePlanRequest paymentPlan; }
