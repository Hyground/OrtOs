package com.ortos.api.modules.appointments;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
public class Cita {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @Column(name = "appointment_type_id", nullable = false)
    private Short appointmentTypeId;

    @Column(name = "priority_id", nullable = false)
    private Short priorityId;

    @Column(name = "status_id", nullable = false)
    private Short statusId;

    @Column(name = "appointment_at", nullable = false)
    private OffsetDateTime appointmentAt;

    private String notes;

    /** Compatibility accessor for read-only patient summaries; appointments no longer store a treatment. */
    public LocalDate getDate() {
        return appointmentAt == null ? null : appointmentAt.toLocalDate();
    }

    /** Treatments belong to the clinical module in the normalized model. */
    public String getTreatment() {
        return null;
    }
}
