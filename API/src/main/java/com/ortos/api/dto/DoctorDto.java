package com.ortos.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorDto {
    private String id;
    private String names;
    private String surnames;
    private String dpi;
    private String specialty;
    private String address;
    private String phone;
    private String email;
    private String status;
    private String photo;

    // solo lectura
    private String name;
}
