package com.wave.gt.ortos.cita.data.local

import com.wave.gt.ortos.cita.domain.AppointmentStatus
import com.wave.gt.ortos.cita.domain.PatientAppointment
import kotlinx.coroutines.delay
import java.time.LocalDate
import java.time.LocalTime

class LocalCitaDataSource {

    suspend fun getMyAppointments(): List<PatientAppointment> {
        delay(250)
        return listOf(
            PatientAppointment(
                id = "my-apt-1",
                date = LocalDate.of(2026, 9, 18),
                time = LocalTime.of(10, 0),
                durationMinutes = 45,
                title = "Control y entrega de alineadores",
                dentistName = "Dra. Ana Lopez",
                locationLabel = "Consultorio 3",
                status = AppointmentStatus.Confirmed,
                reminderLabel = "Recordatorio: 24 horas antes",
                notes = "Llevar el alineador actual y llegar 10 minutos antes."
            ),
            PatientAppointment(
                id = "my-apt-2",
                date = LocalDate.of(2026, 9, 30),
                time = LocalTime.of(16, 30),
                durationMinutes = 30,
                title = "Revision de progreso",
                dentistName = "Dr. Carlos Mendez",
                locationLabel = "Clinica central",
                status = AppointmentStatus.Scheduled,
                reminderLabel = "Recordatorio: el mismo dia por la manana",
                notes = "Evaluacion fotografica y ajuste de plan."
            ),
            PatientAppointment(
                id = "my-apt-3",
                date = LocalDate.of(2026, 10, 14),
                time = LocalTime.of(9, 15),
                durationMinutes = 60,
                title = "Limpieza y control periodontal",
                dentistName = "Dra. Ana Lopez",
                locationLabel = "Consultorio 2",
                status = AppointmentStatus.Scheduled,
                reminderLabel = "Recordatorio: 48 horas antes",
                notes = "Evitar bebidas oscuras antes de la cita."
            ),
            PatientAppointment(
                id = "my-apt-4",
                date = LocalDate.of(2026, 8, 28),
                time = LocalTime.of(11, 0),
                durationMinutes = 40,
                title = "Control anterior",
                dentistName = "Dra. Ana Lopez",
                locationLabel = "Consultorio 1",
                status = AppointmentStatus.Completed,
                reminderLabel = "Asistida",
                notes = "Cita completada."
            )
        ).sortedWith(compareBy(PatientAppointment::date, PatientAppointment::time))
    }
}