package com.ortos.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "historial_clinico")
@Getter
@Setter
public class HistorialClinico {
    @Id
    private String id;

    @Column(name = "patient_id")
    private String patientId;

    private LocalDate date;
    private String treatment;
    private String dentist;
    private String notes;
}
