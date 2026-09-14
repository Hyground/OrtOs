package com.wave.gt.ortos.cita.ui

import com.wave.gt.ortos.cita.domain.AppointmentStatus
import com.wave.gt.ortos.cita.domain.PatientAppointment
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth

data class CitaUiState(
    val isLoading: Boolean = true,
    val appointments: List<PatientAppointment> = emptyList(),
    val visibleMonth: YearMonth = YearMonth.now(),
    val selectedDate: LocalDate = LocalDate.now(),
    val form: AppointmentFormState? = null
) {
    val upcomingAppointments: List<PatientAppointment>
        get() = appointments
            .filter { !it.date.isBefore(LocalDate.now()) }
            .filter { it.status == AppointmentStatus.Scheduled || it.status == AppointmentStatus.Confirmed }
            .sortedWith(compareBy(PatientAppointment::date, PatientAppointment::time))

    val nextAppointment: PatientAppointment?
        get() = upcomingAppointments.firstOrNull()

    val selectedDayAppointments: List<PatientAppointment>
        get() = appointments.filter { it.date == selectedDate }.sortedBy { it.time }

    val currentMonthAppointments: List<PatientAppointment>
        get() = appointments.filter { YearMonth.from(it.date) == visibleMonth }
}

data class AppointmentFormState(
    val mode: AppointmentFormMode,
    val editingAppointmentId: String? = null,
    val date: LocalDate,
    val treatment: String,
    val doctor: String,
    val time: LocalTime
)

enum class AppointmentFormMode {
    Schedule,
    Reschedule
}