package com.ortos.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
public class Usuario {
    @Id
    private String id;

    @Column(name = "display_name")
    private String displayName;

    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    private String role;
    private boolean active = true;

    @Column(name = "medico_id")
    private String medicoId;

    @Column(name = "patient_id")
    private String patientId;

    @Column(name = "codigo_recuperacion")
    private String codigoRecuperacion;

    @Column(name = "codigo_recuperacion_expira")
    private LocalDateTime codigoRecuperacionExpira;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;
}
