package com.ortos.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "odontograma")
@IdClass(OdontogramaId.class)
@Getter
@Setter
public class OdontogramaRegistro {
    @Id
    @Column(name = "patient_id")
    private String patientId;

    @Id
    @Column(name = "tooth_number")
    private Integer toothNumber;

    @Id
    private String surface;

    private String state = "sinRegistro";
    private String treatment;
    private String notes;

    @Column(name = "registrado_por")
    private String registradoPor;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
