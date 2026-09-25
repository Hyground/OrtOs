package com.ortos.api.modules.appointments;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class AppointmentDto {
    private String id;
    private String patientId;
    private String doctorId;
    private Short appointmentTypeId;
    private Short priorityId;
    private Short statusId;
    @NotNull(message = "La fecha y hora de la cita es obligatoria.")
    private OffsetDateTime appointmentAt;
    private String notes;
}
