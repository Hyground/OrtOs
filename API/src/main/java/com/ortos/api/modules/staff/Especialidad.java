package com.ortos.api.modules.staff;

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
