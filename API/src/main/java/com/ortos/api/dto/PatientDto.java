package com.ortos.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientDto {
    private String id;
    private String names;
    private String surnames;
    private String dpi;
    private String phone;
    private String secondaryPhone;
    private String email;
    private String birthDate;
    private String gender;
    private String maritalStatus;
    private String occupation;
    private String department;
    private String municipality;
    private String address;
    private String reference;
    private String bloodGroup;
    private String allergies;
    private String diseases;
    private boolean medications;
    private boolean smoker;
    private String notes;
    private String photo;
    private String status;

    // solo lectura
    private String name;
    private String folio;
    private String createdAt;
    private Integer age;
    private double balance;
    private String treatment;
    private String lastAppointment;
}
