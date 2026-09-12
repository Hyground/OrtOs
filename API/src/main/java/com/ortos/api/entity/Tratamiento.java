package com.ortos.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "tratamientos")
@Getter
@Setter
public class Tratamiento {
    @Id
    private String id;

    private String name;
    private String description;
    private String category;
    private BigDecimal price;

    @Column(name = "duration_min")
    private Integer durationMin;

    private boolean active = true;
}
