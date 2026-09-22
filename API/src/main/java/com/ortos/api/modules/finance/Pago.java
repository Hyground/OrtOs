package com.ortos.api.modules.finance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Getter
@Setter
public class Pago {
    @Id
    private String id;

    @Column(name = "patient_id")
    private String patientId;

    @Column(name = "appointment_id")
    private String appointmentId;

    private String concept;
    private String treatment;
    private LocalDate date;
    private BigDecimal amount;
    private String currency = "GTQ";
    private String method;
    private String reference;
    private String notes;
    private boolean receipt;

    @Column(name = "receipt_number")
    private String receiptNumber;

    private String status = "Registrado";

    @Column(name = "registrado_por")
    private String registradoPor;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}
