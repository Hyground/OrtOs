package com.wave.gt.ortos.cita.domain

import java.time.LocalDate
import java.time.LocalTime

data class PatientAppointment(
    val id: String,
    val date: LocalDate,
    val time: LocalTime,
    val durationMinutes: Int,
    val title: String,
    val dentistName: String,
    val locationLabel: String,
    val status: AppointmentStatus,
    val reminderLabel: String,
    val notes: String
)

enum class AppointmentStatus {
    Scheduled,
    Confirmed,
    Completed,
    Cancelled
}