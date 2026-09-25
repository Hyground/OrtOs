package com.ortos.api.modules.appointments;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "appointment_priorities")
@Getter @Setter
public class AppointmentPriority {
    @Id private Short id;
    private String name;
    private Short level;
}
