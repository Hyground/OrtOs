package com.ortos.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "citas")
@Getter
@Setter
public class Cita {
    @Id
    private String id;

    @Column(name = "patient_id")
    private String patientId;

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

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "creada_por")
    private String creadaPor;
}
