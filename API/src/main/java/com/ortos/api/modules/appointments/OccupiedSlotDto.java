package com.ortos.api.modules.appointments;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
public class OccupiedSlotDto {
    private UUID appointmentId;
    private OffsetDateTime appointmentAt;
    private String status;
}
