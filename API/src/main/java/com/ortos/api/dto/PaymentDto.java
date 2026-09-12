package com.ortos.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentDto {
    private String id;
    private String patientId;
    private String concept;
    private String treatment;
    private String date;
    private BigDecimal amount;
    private String currency;
    private String method;
    private String reference;
    private String notes;
    private boolean receipt;
    private String status;

    // solo lectura
    private String receiptNumber;
    private String registradoPor;
    private String fechaCreacion;
}
