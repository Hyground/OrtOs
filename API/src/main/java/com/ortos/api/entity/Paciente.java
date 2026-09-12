package com.ortos.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacientes")
@Getter
@Setter
public class Paciente {
    @Id
    private String id;

    private String names;
    private String surnames;
    private String dpi;
    private String phone;

    @Column(name = "secondary_phone")
    private String secondaryPhone;

    private String email;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    private String gender;

    @Column(name = "marital_status")
    private String maritalStatus;

    private String occupation;
    private String department;
    private String municipality;
    private String address;
    private String reference;

    @Column(name = "blood_group")
    private String bloodGroup;

    private String allergies;
    private String diseases;
    private boolean medications;
    private boolean smoker;
    private String notes;
    private String photo;
    private String status = "Activo";
    private String folio;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
