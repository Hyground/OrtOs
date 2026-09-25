package com.ortos.api.modules.appointments;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "appointment_types")
@Getter @Setter
public class AppointmentType {
    @Id private Short id;
    private String name;
    private String description;
    private boolean isActive;
}
