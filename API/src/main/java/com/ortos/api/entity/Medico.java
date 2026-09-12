package com.ortos.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "medicos")
@Getter
@Setter
public class Medico {
    @Id
    private String id;

    private String names;
    private String surnames;
    private String dpi;
    private String specialty;
    private String address;
    private String phone;
    private String email;
    private String status = "Activo";
    private String photo;
}
