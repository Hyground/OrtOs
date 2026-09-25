package com.ortos.api.modules.appointments;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
public class CalendarAppointmentDto {
    private UUID appointmentId;
    private OffsetDateTime appointmentAt;
    private String patientId;
    private String patientName;
    private String doctorId;
    private String doctorName;
    private String appointmentType;
    private String priority;
    private String status;
    private String notes;
}
