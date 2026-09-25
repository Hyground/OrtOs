package com.ortos.api.modules.appointments;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AvailabilityCheckDto {
    private boolean available;
    private UUID conflictingAppointmentId;
}
