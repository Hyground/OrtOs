package com.ortos.api.modules.appointments;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "appointment_statuses")
@Getter @Setter
public class AppointmentStatus {
    @Id private Short id;
    private String name;
}
