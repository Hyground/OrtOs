package com.wave.gt.ortos.home.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.wave.gt.ortos.R
import com.wave.gt.ortos.core.diffCallback
import com.wave.gt.ortos.databinding.ItemHomeHeaderBinding
import com.wave.gt.ortos.databinding.ItemHomeNextAppointmentBinding
import com.wave.gt.ortos.databinding.ItemHomePaymentsBinding
import com.wave.gt.ortos.databinding.ItemHomePromotionsBinding
import com.wave.gt.ortos.databinding.ItemHomeTreatmentBinding
import java.text.NumberFormat
import java.util.Locale

class HomeAdapter(
    private val actions: HomeActions
) : ListAdapter<HomeItem, RecyclerView.ViewHolder>(diffCallback { old, new -> old.id == new.id }) {

    override fun getItemViewType(position: Int): Int = when (getItem(position)) {
        is HomeItem.Header -> TYPE_HEADER
        is HomeItem.Treatment -> TYPE_TREATMENT
        is HomeItem.Promotions -> TYPE_PROMOTIONS
        is HomeItem.NextAppointment -> TYPE_APPOINTMENT
        is HomeItem.Payments -> TYPE_PAYMENTS
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return when (viewType) {
            TYPE_HEADER -> HeaderViewHolder(ItemHomeHeaderBinding.inflate(inflater, parent, false))
            TYPE_TREATMENT -> TreatmentViewHolder(ItemHomeTreatmentBinding.inflate(inflater, parent, false))
            TYPE_PROMOTIONS -> PromotionsViewHolder(ItemHomePromotionsBinding.inflate(inflater, parent, false))
            TYPE_APPOINTMENT -> AppointmentViewHolder(ItemHomeNextAppointmentBinding.inflate(inflater, parent, false))
            else -> PaymentsViewHolder(ItemHomePaymentsBinding.inflate(inflater, parent, false))
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val item = getItem(position)) {
            is HomeItem.Header -> (holder as HeaderViewHolder).bind(item)
            is HomeItem.Treatment -> (holder as TreatmentViewHolder).bind(item)
            is HomeItem.Promotions -> (holder as PromotionsViewHolder).bind(item)
            is HomeItem.NextAppointment -> (holder as AppointmentViewHolder).bind(item)
            is HomeItem.Payments -> (holder as PaymentsViewHolder).bind(item)
        }
    }

    class HeaderViewHolder(
        private val binding: ItemHomeHeaderBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: HomeItem.Header) {
            val context = binding.root.context
            binding.textGreeting.text = context.getString(R.string.home_greeting, item.patientName)
            binding.textAvatar.text = item.patientName.trim().take(1).uppercase(Locale.getDefault())
        }
    }

    inner class TreatmentViewHolder(
        private val binding: ItemHomeTreatmentBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: HomeItem.Treatment) {
            val context = binding.root.context
            val progress = item.progress

            binding.textTreatmentName.text = progress.treatmentName
            binding.textTreatmentStep.text = context.getString(
                R.string.home_treatment_step, progress.currentStep, progress.totalSteps
            )
            binding.textTreatmentPercent.text =
                context.getString(R.string.home_treatment_percent, progress.completionPercent)
            binding.progressTreatment.setProgressCompat(progress.completionPercent, true)
            binding.textNextChange.text = context.getString(
                R.string.home_treatment_next_value, progress.nextChangeLabel, progress.nextStep
            )

            binding.cardTreatment.setOnClickListener { actions.onOpenTreatment() }
        }
    }

    inner class PromotionsViewHolder(
        private val binding: ItemHomePromotionsBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        private val promotionAdapter = PromotionAdapter(actions::onPromotionClick)

        init {
            binding.recyclerPromotions.layoutManager = LinearLayoutManager(
                binding.root.context, LinearLayoutManager.HORIZONTAL, false
            )
            binding.recyclerPromotions.adapter = promotionAdapter
        }

        fun bind(item: HomeItem.Promotions) {
            promotionAdapter.submitList(item.promotions)
        }
    }

    inner class AppointmentViewHolder(
        private val binding: ItemHomeNextAppointmentBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: HomeItem.NextAppointment) {
            val context = binding.root.context
            val appointment = item.appointment

            binding.textMonth.text = appointment.monthLabel
            binding.textDay.text = appointment.dayLabel
            binding.textAppointmentMeta.text =
                context.getString(R.string.home_appointment_meta, appointment.timeLabel)
            binding.textAppointmentTitle.text = appointment.title
            binding.textAppointmentDentist.text = context.getString(
                R.string.home_appointment_dentist,
                appointment.dentistName,
                appointment.locationLabel
            )

            binding.cardAppointment.setOnClickListener { actions.onOpenAppointments() }
        }
    }

    inner class PaymentsViewHolder(
        private val binding: ItemHomePaymentsBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: HomeItem.Payments) {
            val context = binding.root.context
            val summary = item.summary
            val amount = currency.format(summary.pendingBalance)

            binding.textPaymentLabel.text = summary.label
            binding.textPaymentAmount.text = if (summary.dueDateLabel != null) {
                context.getString(R.string.home_payment_amount_due, amount, summary.dueDateLabel)
            } else {
                amount
            }
            binding.buttonPay.setOnClickListener { actions.onOpenPayments() }
        }
    }

    private companion object {
        const val TYPE_HEADER = 0
        const val TYPE_TREATMENT = 1
        const val TYPE_PROMOTIONS = 2
        const val TYPE_APPOINTMENT = 3
        const val TYPE_PAYMENTS = 4

        val currency: NumberFormat = NumberFormat.getCurrencyInstance(Locale("es", "GT"))
    }
}
