package com.ortos.api.modules.staff;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpecialtyDto {
    private String id;
    private String name;
    private String description;

    // solo lectura
    private long totalMedicos;
}
