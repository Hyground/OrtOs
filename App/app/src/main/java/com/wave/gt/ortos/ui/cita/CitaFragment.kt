package com.wave.gt.ortos.ui.cita

import android.app.DatePickerDialog
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.wave.gt.ortos.R
import com.wave.gt.ortos.cita.domain.AppointmentStatus
import com.wave.gt.ortos.cita.domain.PatientAppointment
import com.wave.gt.ortos.cita.ui.AppointmentAdapter
import com.wave.gt.ortos.cita.ui.AppointmentFormMode
import com.wave.gt.ortos.cita.ui.AppointmentFormState
import com.wave.gt.ortos.cita.ui.CitaFormatters
import com.wave.gt.ortos.cita.ui.CitaUiState
import com.wave.gt.ortos.cita.ui.CitaViewModel
import com.wave.gt.ortos.databinding.FragmentCitaBinding
import com.wave.gt.ortos.di.ViewModelFactory
import com.wave.gt.ortos.di.appContainer
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.YearMonth
import java.time.temporal.ChronoUnit

class CitaFragment : Fragment(R.layout.fragment_cita) {

    private var _binding: FragmentCitaBinding? = null
    private val binding get() = _binding!!
    private var panelVisible = false
    private var currentForm: AppointmentFormState? = null

    private val viewModel: CitaViewModel by viewModels {
        ViewModelFactory { CitaViewModel(appContainer.getMyAppointmentsUseCase) }
    }

    private val appointmentAdapter by lazy {
        AppointmentAdapter(
            onReschedule = viewModel::openReschedule,
            onCancel = ::confirmCancelAppointment
        )
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentCitaBinding.bind(view)
        binding.recyclerAppointments.adapter = appointmentAdapter
        setupClicks()
        observeState()
    }

    private fun setupClicks() {
        binding.buttonPrevMonth.setOnClickListener { viewModel.moveMonth(-1) }
        binding.buttonPrevWeek.setOnClickListener { viewModel.moveWeek(-1) }
        binding.buttonNextWeek.setOnClickListener { viewModel.moveWeek(1) }
        binding.buttonNextMonth.setOnClickListener { viewModel.moveMonth(1) }
        binding.buttonToday.setOnClickListener { viewModel.goToday() }
        binding.buttonSchedule.setOnClickListener { viewModel.openSchedule(currentSelectedDate()) }
        binding.buttonPanelClose.setOnClickListener { viewModel.closeForm() }
        binding.panelOverlay.setOnClickListener { viewModel.closeForm() }
        binding.appointmentPanel.setOnClickListener { }
        binding.fieldDate.setOnClickListener { currentForm?.let { showDatePicker(it.date) } }
        binding.fieldTreatment.setOnClickListener {
            showOptionPicker(getString(R.string.cita_treatment_label), viewModel.treatments, currentTreatmentIndex()) {
                viewModel.updateFormTreatment(viewModel.treatments[it])
            }
        }
        binding.fieldDoctor.setOnClickListener {
            showOptionPicker(getString(R.string.cita_doctor_label), viewModel.doctors, currentDoctorIndex()) {
                viewModel.updateFormDoctor(viewModel.doctors[it])
            }
        }
        binding.fieldTime.setOnClickListener {
            showOptionPicker(getString(R.string.cita_time_label), timeLabels(), currentTimeIndex()) {
                viewModel.updateFormTime(viewModel.availableTimes[it])
            }
        }
        binding.buttonPanelConfirm.setOnClickListener { confirmForm() }
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { render(it) }
            }
        }
    }

    private fun render(state: CitaUiState) {
        binding.progress.isVisible = state.isLoading
        renderNextAppointment(state.nextAppointment)
        renderWeekCalendar(state)
        binding.textSelectedDayTitle.text = getString(R.string.cita_upcoming_title)
        binding.textUpcomingCount.text = resources.getQuantityString(
            R.plurals.cita_upcoming_count,
            state.upcomingAppointments.size,
            state.upcomingAppointments.size
        )
        appointmentAdapter.submitList(state.upcomingAppointments)
        binding.textEmptyDay.isVisible = !state.isLoading && state.upcomingAppointments.isEmpty()
        currentForm = state.form
        renderForm(state.form)
    }

    private fun renderNextAppointment(appointment: PatientAppointment?) {
        val hasNext = appointment != null
        binding.buttonRescheduleNext.isVisible = hasNext
        binding.buttonRescheduleNext.setOnClickListener { appointment?.let(viewModel::openReschedule) }

        if (appointment == null) {
            binding.textCountdownValue.text = getString(R.string.cita_empty_next)
            binding.textNextStatus.text = ""
            binding.textNextTitle.text = ""
            binding.textNextTime.text = ""
            binding.textNextMeta.text = ""
            return
        }

        binding.textCountdownValue.text = countdownLabel(appointment)
        binding.textNextStatus.text = statusLabel(appointment.status)
        binding.textNextTitle.text = appointment.title
        binding.textNextTime.text = getString(
            R.string.home_appointment_dentist,
            CitaFormatters.shortDate.format(appointment.date),
            CitaFormatters.time.format(appointment.time)
        )
        binding.textNextMeta.text = getString(
            R.string.home_appointment_dentist,
            appointment.dentistName,
            appointment.locationLabel
        )
    }

    private fun renderWeekCalendar(state: CitaUiState) {
        val context = requireContext()
        val month = state.visibleMonth
        binding.textMonthLabel.text = CitaFormatters.month.format(month).uppercase()
        binding.layoutCalendarWeeks.removeAllViews()

        val appointmentDates = state.upcomingAppointments.map { it.date }.toSet()
        var day = firstVisibleDate(state.selectedDate)

        repeat(14) {
            val date = day
            val item = LinearLayout(context).apply {
                gravity = Gravity.CENTER
                orientation = LinearLayout.VERTICAL
                isClickable = true
                isFocusable = true
                alpha = if (YearMonth.from(date) == month) 1f else 0.42f
                background = calendarBackground(
                    isSelected = date == state.selectedDate,
                    isToday = date == LocalDate.now(),
                    hasAppointment = appointmentDates.contains(date)
                )
                setPadding(0, 8.dp, 0, 8.dp)
                setOnClickListener { viewModel.selectDate(date) }
            }
            item.addView(TextView(context).apply {
                text = weekdayFormatter(date)
                gravity = Gravity.CENTER
                textSize = 11f
                setTextColor(calendarTextColor(date, state.selectedDate))
                typeface = Typeface.DEFAULT_BOLD
            })
            item.addView(TextView(context).apply {
                text = date.dayOfMonth.toString()
                gravity = Gravity.CENTER
                textSize = 16f
                setTextColor(calendarTextColor(date, state.selectedDate))
                typeface = Typeface.DEFAULT_BOLD
            })
            binding.layoutCalendarWeeks.addView(item, LinearLayout.LayoutParams(54.dp, 58.dp).apply {
                setMargins(3.dp, 0, 3.dp, 0)
            })
            day = day.plusDays(1)
        }
    }

    private fun renderForm(form: AppointmentFormState?) {
        binding.buttonSchedule.isVisible = form == null
        if (form == null) {
            hidePanel()
            return
        }
        binding.textPanelTitle.text = getString(
            if (form.mode == AppointmentFormMode.Schedule) R.string.cita_schedule else R.string.cita_reschedule
        )
        binding.buttonPanelConfirm.text = binding.textPanelTitle.text
        binding.textPanelDate.text = CitaFormatters.dayTitle.format(form.date)
        binding.textPanelTreatment.text = form.treatment
        binding.textPanelDoctor.text = form.doctor
        binding.textPanelTime.text = CitaFormatters.time.format(form.time)
        showPanel()
    }

    private fun showPanel() {
        if (panelVisible) return
        panelVisible = true
        val panelWidth = (resources.displayMetrics.widthPixels * 0.95f).toInt()
        binding.appointmentPanel.layoutParams = binding.appointmentPanel.layoutParams.apply { width = panelWidth }
        binding.panelOverlay.alpha = 0f
        binding.panelOverlay.isVisible = true
        binding.appointmentPanel.translationX = panelWidth.toFloat()
        binding.panelOverlay.animate().alpha(1f).setDuration(140).start()
        binding.appointmentPanel.animate().translationX(0f).setDuration(220).start()
    }

    private fun hidePanel() {
        if (!panelVisible) return
        panelVisible = false
        val panelWidth = binding.appointmentPanel.width.takeIf { it > 0 } ?: resources.displayMetrics.widthPixels
        binding.appointmentPanel.animate().translationX(panelWidth.toFloat()).setDuration(180).start()
        binding.panelOverlay.animate()
            .alpha(0f)
            .setDuration(180)
            .withEndAction { binding.panelOverlay.isVisible = false }
            .start()
    }

    private fun showDatePicker(initialDate: LocalDate) {
        DatePickerDialog(
            requireContext(),
            { _, year, month, day -> viewModel.updateFormDate(LocalDate.of(year, month + 1, day)) },
            initialDate.year,
            initialDate.monthValue - 1,
            initialDate.dayOfMonth
        ).apply {
            datePicker.minDate = System.currentTimeMillis() - 1000
            show()
        }
    }

    private fun showOptionPicker(
        title: String,
        options: List<String>,
        selectedIndex: Int,
        onSelected: (Int) -> Unit
    ) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle(title)
            .setSingleChoiceItems(options.toTypedArray(), selectedIndex) { dialog, which ->
                onSelected(which)
                dialog.dismiss()
            }
            .show()
    }

    private fun confirmForm() {
        val mode = viewModel.confirmForm() ?: return
        Snackbar.make(
            binding.root,
            if (mode == AppointmentFormMode.Schedule) R.string.cita_scheduled_message else R.string.cita_rescheduled_message,
            Snackbar.LENGTH_SHORT
        ).show()
    }

    private fun confirmCancelAppointment(appointment: PatientAppointment) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle(R.string.cita_cancel_title)
            .setMessage(R.string.cita_cancel_message)
            .setNegativeButton(R.string.cita_keep, null)
            .setPositiveButton(R.string.cita_cancel) { _, _ ->
                viewModel.cancelAppointment(appointment.id)
                Snackbar.make(binding.root, R.string.cita_cancelled_message, Snackbar.LENGTH_SHORT).show()
            }
            .show()
    }

    private fun countdownLabel(appointment: PatientAppointment): String {
        val now = LocalDateTime.now()
        val target = LocalDateTime.of(appointment.date, appointment.time)
        if (!target.isAfter(now)) return getString(R.string.cita_today)
        val months = ChronoUnit.MONTHS.between(now.toLocalDate().withDayOfMonth(1), appointment.date.withDayOfMonth(1))
        val days = ChronoUnit.DAYS.between(now.toLocalDate(), appointment.date)
        val hours = ChronoUnit.HOURS.between(now, target).coerceAtLeast(1)
        val value = when {
            months >= 1 -> resources.getQuantityString(R.plurals.cita_countdown_months, months.toInt(), months)
            days >= 1 -> resources.getQuantityString(R.plurals.cita_countdown_days, days.toInt(), days)
            else -> resources.getQuantityString(R.plurals.cita_countdown_hours, hours.toInt(), hours)
        }
        return getString(R.string.cita_countdown_value, value)
    }

    private fun statusLabel(status: AppointmentStatus): String = when (status) {
        AppointmentStatus.Scheduled -> getString(R.string.cita_status_scheduled)
        AppointmentStatus.Confirmed -> getString(R.string.cita_status_confirmed)
        AppointmentStatus.Completed -> getString(R.string.cita_status_completed)
        AppointmentStatus.Cancelled -> getString(R.string.cita_status_cancelled)
    }

    private fun currentSelectedDate(): LocalDate = viewModel.uiState.value.selectedDate

    private fun currentTreatmentIndex(): Int = viewModel.treatments.indexOf(currentForm?.treatment).coerceAtLeast(0)

    private fun currentDoctorIndex(): Int = viewModel.doctors.indexOf(currentForm?.doctor).coerceAtLeast(0)

    private fun currentTimeIndex(): Int = viewModel.availableTimes.indexOf(currentForm?.time).coerceAtLeast(0)

    private fun timeLabels(): List<String> = viewModel.availableTimes.map(CitaFormatters.time::format)

    private fun calendarTextColor(date: LocalDate, selectedDate: LocalDate): Int {
        val context = requireContext()
        return if (date == selectedDate) {
            ContextCompat.getColor(context, R.color.white)
        } else {
            ContextCompat.getColor(context, R.color.light_on_surface)
        }
    }

    private fun calendarBackground(
        isSelected: Boolean,
        isToday: Boolean,
        hasAppointment: Boolean
    ): GradientDrawable {
        val context = requireContext()
        return GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = 18.dp.toFloat()
            when {
                isSelected -> setColor(ContextCompat.getColor(context, R.color.cita_accent_on))
                hasAppointment -> setColor(ContextCompat.getColor(context, R.color.cita_accent_soft))
                else -> setColor(ContextCompat.getColor(context, android.R.color.transparent))
            }
            if (isToday && !isSelected) {
                setStroke(2.dp, ContextCompat.getColor(context, R.color.cita_accent))
            }
        }
    }

    private fun firstVisibleDate(date: LocalDate): LocalDate {
        val sundayBasedOffset = date.dayOfWeek.value % 7
        return date.minusDays(sundayBasedOffset.toLong())
    }

    private fun weekdayFormatter(date: LocalDate): String = date.dayOfWeek
        .getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.forLanguageTag("es-GT"))
        .take(3)
        .uppercase()

    private val Int.dp: Int
        get() = (this * resources.displayMetrics.density).toInt()

    override fun onDestroyView() {
        binding.recyclerAppointments.adapter = null
        _binding = null
        super.onDestroyView()
    }
}
