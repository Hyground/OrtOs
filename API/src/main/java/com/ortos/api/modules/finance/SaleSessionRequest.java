package com.ortos.api.modules.finance;
import lombok.Getter; import lombok.Setter;
@Getter @Setter public class SaleSessionRequest { private String date; private String time; private String dentistId; private String chair; private String duration; private String notes; }
