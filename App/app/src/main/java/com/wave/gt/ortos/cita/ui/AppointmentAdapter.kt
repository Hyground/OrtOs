package com.wave.gt.ortos.cita.ui

import android.content.Context
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.wave.gt.ortos.R
import com.wave.gt.ortos.cita.domain.AppointmentStatus
import com.wave.gt.ortos.cita.domain.PatientAppointment
import com.wave.gt.ortos.core.diffCallback
import com.wave.gt.ortos.databinding.ItemCitaAppointmentBinding

class AppointmentAdapter(
    private val onReschedule: (PatientAppointment) -> Unit,
    private val onCancel: (PatientAppointment) -> Unit
) : ListAdapter<PatientAppointment, AppointmentAdapter.ViewHolder>(
    diffCallback { old, new -> old.id == new.id }
) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolder(ItemCitaAppointmentBinding.inflate(inflater, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    inner class ViewHolder(
        private val binding: ItemCitaAppointmentBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(appointment: PatientAppointment) {
            val context = binding.root.context
            val canEdit = appointment.status == AppointmentStatus.Scheduled || appointment.status == AppointmentStatus.Confirmed

            binding.textDateMonth.text = CitaFormatters.monthShort.format(appointment.date).take(3).uppercase()
            binding.textDateDay.text = appointment.date.dayOfMonth.toString()
            binding.textTime.text = CitaFormatters.time.format(appointment.time)
            binding.textTitle.text = appointment.title
            binding.textMeta.text = "${appointment.locationLabel} - ${appointment.durationMinutes} min - ${statusLabel(context, appointment.status)}"
            binding.buttonItemReschedule.isVisible = canEdit
            binding.buttonItemCancel.isVisible = canEdit
            binding.buttonItemReschedule.setOnClickListener { onReschedule(appointment) }
            binding.buttonItemCancel.setOnClickListener { onCancel(appointment) }
        }

        private fun statusLabel(context: Context, status: AppointmentStatus): String = when (status) {
            AppointmentStatus.Scheduled -> context.getString(R.string.cita_status_scheduled)
            AppointmentStatus.Confirmed -> context.getString(R.string.cita_status_confirmed)
            AppointmentStatus.Completed -> context.getString(R.string.cita_status_completed)
            AppointmentStatus.Cancelled -> context.getString(R.string.cita_status_cancelled)
        }
    }

}
