package com.wave.gt.ortos.pagos.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.wave.gt.ortos.R
import com.wave.gt.ortos.core.diffCallback
import com.wave.gt.ortos.databinding.ItemPagoBinding
import com.wave.gt.ortos.pagos.domain.PatientPayment
import com.wave.gt.ortos.pagos.domain.PaymentStatus
import java.text.NumberFormat
import java.time.format.DateTimeFormatter
import java.util.Locale

class PaymentAdapter(
    private val onPay: (PatientPayment) -> Unit
) : ListAdapter<PatientPayment, PaymentAdapter.ViewHolder>(
    diffCallback { old, new -> old.id == new.id }
) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolder(ItemPagoBinding.inflate(inflater, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    inner class ViewHolder(
        private val binding: ItemPagoBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(payment: PatientPayment) {
            val context = binding.root.context
            val amount = currency.format(payment.amount)
            val dateLabel = if ((payment.status == PaymentStatus.Paid || payment.status == PaymentStatus.InReview) && payment.paidDate != null) {
                context.getString(R.string.pagos_reported_on, dateFormatter.format(payment.paidDate))
            } else {
                context.getString(R.string.pagos_due_on, dateFormatter.format(payment.dueDate))
            }

            binding.textPaymentStatus.text = statusLabel(payment.status)
            binding.textPaymentTitle.text = payment.concept
            binding.textPaymentAmount.text = amount
            binding.textPaymentMeta.text = dateLabel
            binding.textPaymentMethod.text = payment.methodLabel ?: context.getString(R.string.pagos_method_pending)
            binding.buttonPaymentAction.isVisible = payment.status == PaymentStatus.Pending || payment.status == PaymentStatus.Overdue
            binding.buttonPaymentAction.setOnClickListener { onPay(payment) }
        }
    }

    private fun statusLabel(status: PaymentStatus): String = when (status) {
        PaymentStatus.Pending -> "Pendiente"
        PaymentStatus.Overdue -> "Vencido"
        PaymentStatus.InReview -> "En validacion"
        PaymentStatus.Paid -> "Pagado"
    }

    private companion object {
        val currency: NumberFormat = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("es-GT"))
        val dateFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.forLanguageTag("es-GT"))
    }
}