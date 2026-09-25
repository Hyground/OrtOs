package com.ortos.api.modules.appointments;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
public class AvailabilityDto {
    private String doctorId;
    private OffsetDateTime from;
    private OffsetDateTime to;
    private List<OccupiedSlotDto> occupiedSlots;
}
