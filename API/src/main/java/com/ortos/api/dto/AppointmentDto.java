package com.ortos.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentDto {
    private String id;
    private String patientId;
    private String dentist;
    private String date;
    private String time;
    private String duration;
    private String chair;
    private String treatment;
    private String type;
    private String priority;
    private String reminder;
    private String reason;
    private String notes;
    private String status;

    // solo lectura
    private String fechaCreacion;
    private String creadaPor;
}
