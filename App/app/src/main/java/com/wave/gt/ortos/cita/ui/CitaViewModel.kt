package com.wave.gt.ortos.cita.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wave.gt.ortos.cita.domain.AppointmentStatus
import com.wave.gt.ortos.cita.domain.PatientAppointment
import com.wave.gt.ortos.cita.domain.usecase.GetMyAppointmentsUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth

class CitaViewModel(
    private val getMyAppointments: GetMyAppointmentsUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(CitaUiState())
    val uiState: StateFlow<CitaUiState> = _uiState.asStateFlow()

    val treatments: List<String> = CitaCatalog.treatments
    val doctors: List<String> = CitaCatalog.doctors
    val availableTimes = CitaCatalog.availableTimes

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            val appointments = getMyAppointments()
            val today = LocalDate.now()
            val nextDate = appointments
                .filter { it.status == AppointmentStatus.Scheduled || it.status == AppointmentStatus.Confirmed }
                .firstOrNull { !it.date.isBefore(today) }
                ?.date ?: today
            _uiState.update {
                it.copy(
                    isLoading = false,
                    appointments = appointments,
                    selectedDate = nextDate,
                    visibleMonth = YearMonth.from(nextDate)
                )
            }
        }
    }

    fun moveWeek(step: Long) {
        _uiState.update { state ->
            val date = state.selectedDate.plusWeeks(step)
            state.copy(selectedDate = date, visibleMonth = YearMonth.from(date))
        }
    }

    fun moveMonth(step: Long) {
        _uiState.update { state ->
            val month = state.visibleMonth.plusMonths(step)
            state.copy(visibleMonth = month, selectedDate = month.atDay(1))
        }
    }

    fun selectDate(date: LocalDate) {
        _uiState.update { it.copy(selectedDate = date, visibleMonth = YearMonth.from(date)) }
    }

    fun goToday() {
        val today = LocalDate.now()
        _uiState.update { it.copy(selectedDate = today, visibleMonth = YearMonth.from(today)) }
    }

    fun openSchedule(date: LocalDate) {
        _uiState.update { state ->
            state.copy(
                selectedDate = date,
                visibleMonth = YearMonth.from(date),
                form = AppointmentFormState(
                    mode = AppointmentFormMode.Schedule,
                    date = date,
                    treatment = treatments.first(),
                    doctor = doctors.first(),
                    time = availableTimes.first()
                )
            )
        }
    }

    fun openReschedule(appointment: PatientAppointment) {
        _uiState.update { state ->
            state.copy(
                selectedDate = appointment.date,
                visibleMonth = YearMonth.from(appointment.date),
                form = AppointmentFormState(
                    mode = AppointmentFormMode.Reschedule,
                    editingAppointmentId = appointment.id,
                    date = appointment.date,
                    treatment = appointment.title.takeIf { it in treatments } ?: treatments.first(),
                    doctor = appointment.dentistName.takeIf { it in doctors } ?: doctors.first(),
                    time = appointment.time.takeIf { it in availableTimes } ?: availableTimes.first()
                )
            )
        }
    }

    fun closeForm() {
        _uiState.update { it.copy(form = null) }
    }

    fun updateFormDate(date: LocalDate) = updateForm { it.copy(date = date) }

    fun updateFormTreatment(treatment: String) = updateForm { it.copy(treatment = treatment) }

    fun updateFormDoctor(doctor: String) = updateForm { it.copy(doctor = doctor) }

    fun updateFormTime(time: LocalTime) = updateForm { it.copy(time = time) }

    fun confirmForm(): AppointmentFormMode? {
        val form = _uiState.value.form ?: return null
        when (form.mode) {
            AppointmentFormMode.Schedule -> scheduleAppointment(form)
            AppointmentFormMode.Reschedule -> rescheduleAppointment(form)
        }
        closeForm()
        return form.mode
    }

    fun cancelAppointment(id: String) {
        _uiState.update { state ->
            state.copy(appointments = state.appointments.map { appointment ->
                if (appointment.id == id) appointment.copy(status = AppointmentStatus.Cancelled) else appointment
            })
        }
    }

    private fun updateForm(transform: (AppointmentFormState) -> AppointmentFormState) {
        _uiState.update { state ->
            val form = state.form ?: return@update state
            state.copy(form = transform(form))
        }
    }

    private fun scheduleAppointment(form: AppointmentFormState) {
        _uiState.update { state ->
            val item = PatientAppointment(
                id = "local-${System.currentTimeMillis()}",
                date = form.date,
                time = form.time,
                durationMinutes = durationFor(form.treatment),
                title = form.treatment,
                dentistName = form.doctor,
                locationLabel = "Por confirmar",
                status = AppointmentStatus.Scheduled,
                reminderLabel = "",
                notes = ""
            )
            state.copy(
                appointments = (state.appointments + item).sortedWith(compareBy(PatientAppointment::date, PatientAppointment::time)),
                selectedDate = form.date,
                visibleMonth = YearMonth.from(form.date)
            )
        }
    }

    private fun rescheduleAppointment(form: AppointmentFormState) {
        val id = form.editingAppointmentId ?: return
        _uiState.update { state ->
            state.copy(
                appointments = state.appointments.map { appointment ->
                    if (appointment.id == id) {
                        appointment.copy(
                            date = form.date,
                            time = form.time,
                            title = form.treatment,
                            dentistName = form.doctor,
                            durationMinutes = durationFor(form.treatment),
                            status = AppointmentStatus.Scheduled
                        )
                    } else appointment
                }.sortedWith(compareBy(PatientAppointment::date, PatientAppointment::time)),
                selectedDate = form.date,
                visibleMonth = YearMonth.from(form.date)
            )
        }
    }

    private fun durationFor(treatment: String): Int = when (treatment) {
        "Limpieza dental" -> 45
        "Revision de progreso" -> 30
        "Control de retenedores" -> 30
        else -> 40
    }
}