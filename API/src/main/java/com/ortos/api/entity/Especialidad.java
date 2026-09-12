package com.ortos.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "especialidades")
@Getter
@Setter
public class Especialidad {
    @Id
    private String id;

    private String name;
    private String description;
}
