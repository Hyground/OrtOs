package com.ortos.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ServiceDto {
    private String id;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer durationMin;
    private boolean active;

    // solo lectura
    private long vecesSolicitado;
}
