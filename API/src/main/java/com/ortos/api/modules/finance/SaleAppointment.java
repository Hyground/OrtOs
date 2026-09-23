package com.ortos.api.modules.finance;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Maps the existing citas table; sales do not introduce a second appointment system. */
@Entity
@Table(name = "citas")
@Getter @Setter
public class SaleAppointment {
    @Id private String id;
    @Column(name = "patient_id", nullable = false) private String patientId;
    @Column(name = "sale_id") private String saleId;
    @Column(name = "sale_line_id") private String saleLineId;
    @Column(name = "treatment_id") private String treatmentId;
    @Column(name = "dentist_id") private String dentistId;
    @Column(name = "session_number") private Integer sessionNumber;
    private String dentist;
    private LocalDate date;
    private String time;
    private String duration;
    private String chair;
    private String treatment;
    private String type;
    private String priority;
    private String reminder;
    private String reason;
    private String notes;
    private String status = "Pendiente";
    @Column(name = "fecha_creacion") private LocalDateTime createdAt;
    @Column(name = "creada_por") private String createdBy;
}
