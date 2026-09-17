package com.wave.gt.ortos.ui.pagos

import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.wave.gt.ortos.R
import com.wave.gt.ortos.databinding.FragmentPagosBinding
import com.wave.gt.ortos.di.ViewModelFactory
import com.wave.gt.ortos.di.appContainer
import com.wave.gt.ortos.pagos.domain.PatientPayment
import com.wave.gt.ortos.pagos.domain.PaymentDashboard
import com.wave.gt.ortos.pagos.ui.PagosUiState
import com.wave.gt.ortos.pagos.ui.PagosViewModel
import com.wave.gt.ortos.pagos.ui.PaymentAdapter
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.time.format.DateTimeFormatter
import java.util.Locale

class PagosFragment : Fragment(R.layout.fragment_pagos) {

    private var _binding: FragmentPagosBinding? = null
    private val binding get() = _binding!!

    private val viewModel: PagosViewModel by viewModels {
        ViewModelFactory { PagosViewModel(appContainer.getPaymentDashboardUseCase) }
    }

    private val pendingAdapter by lazy { PaymentAdapter(::showReportPaymentDialog) }
    private val paidAdapter by lazy { PaymentAdapter(::showReportPaymentDialog) }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentPagosBinding.bind(view)
        binding.recyclerPendingPayments.adapter = pendingAdapter
        binding.recyclerPaidPayments.adapter = paidAdapter
        observeState()
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect(::render)
            }
        }
    }

    private fun render(state: PagosUiState) {
        binding.progress.isVisible = state.isLoading
        state.dashboard?.let(::renderDashboard)
    }

    private fun renderDashboard(dashboard: PaymentDashboard) {
        val nextPending = dashboard.nextPending
        binding.textPendingAmount.text = getString(
            R.string.pagos_pending_total,
            currency.format(dashboard.pendingTotal)
        )
        binding.textPaidAmount.text = currency.format(dashboard.paidTotal)
        binding.textTreatmentName.text = dashboard.treatmentName
        binding.textNextDue.text = if (nextPending != null) {
            getString(
                R.string.pagos_next_due,
                nextPending.concept,
                dateFormatter.format(nextPending.dueDate)
            )
        } else {
            getString(R.string.pagos_no_next_due)
        }

        pendingAdapter.submitList(dashboard.pendingPayments)
        paidAdapter.submitList(dashboard.historyPayments.sortedByDescending { it.paidDate ?: it.dueDate })
        binding.textEmptyPending.isVisible = dashboard.pendingPayments.isEmpty()
    }

    private fun showReportPaymentDialog(payment: PatientPayment) {
        val context = requireContext()
        val amountInput = EditText(context).apply {
            inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL
            setText(payment.amount.toInt().toString())
            hint = getString(R.string.pagos_amount_hint)
        }
        val referenceInput = EditText(context).apply {
            inputType = InputType.TYPE_CLASS_TEXT
            hint = getString(R.string.pagos_reference_hint)
        }
        val amountGroup = RadioGroup(context).apply {
            orientation = RadioGroup.VERTICAL
            addView(RadioButton(context).apply {
                id = R.id.option_full_payment
                text = getString(R.string.pagos_full_payment, currency.format(payment.amount))
                isChecked = true
            })
            addView(RadioButton(context).apply {
                id = R.id.option_partial_payment
                text = getString(R.string.pagos_partial_payment)
            })
            setOnCheckedChangeListener { _, checkedId ->
                amountInput.isEnabled = checkedId == R.id.option_partial_payment
                if (checkedId == R.id.option_full_payment) amountInput.setText(payment.amount.toInt().toString())
            }
        }
        val methodGroup = RadioGroup(context).apply {
            orientation = RadioGroup.VERTICAL
            addView(RadioButton(context).apply {
                id = R.id.option_transfer_payment
                text = getString(R.string.pagos_method_transfer)
                isChecked = true
            })
            addView(RadioButton(context).apply {
                id = R.id.option_card_payment
                text = getString(R.string.pagos_method_card)
            })
            addView(RadioButton(context).apply {
                id = R.id.option_cash_payment
                text = getString(R.string.pagos_method_cash)
            })
        }
        amountInput.isEnabled = false

        val content = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(8.dp, 4.dp, 8.dp, 0)
            addView(TextView(context).apply {
                text = getString(R.string.pagos_report_explanation)
                setPadding(0, 0, 0, 12.dp)
            })
            addView(amountGroup)
            addView(amountInput)
            addView(TextView(context).apply {
                text = getString(R.string.pagos_method_label)
                setPadding(0, 12.dp, 0, 0)
            })
            addView(methodGroup)
            addView(referenceInput)
        }

        val dialog = MaterialAlertDialogBuilder(context)
            .setTitle(R.string.pagos_report_payment_title)
            .setView(content)
            .setNegativeButton(android.R.string.cancel, null)
            .setPositiveButton(R.string.pagos_send_report, null)
            .create()

        dialog.setOnShowListener {
            dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                val amount = amountInput.text.toString().toDoubleOrNull() ?: 0.0
                val reference = referenceInput.text.toString().trim()
                if (amount <= 0.0 || amount > payment.amount) {
                    Snackbar.make(binding.root, R.string.pagos_invalid_amount, Snackbar.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                if (reference.isBlank()) {
                    Snackbar.make(binding.root, R.string.pagos_reference_required, Snackbar.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                viewModel.reportPayment(payment, amount, selectedMethod(methodGroup.checkedRadioButtonId), reference)
                dialog.dismiss()
                Snackbar.make(binding.root, R.string.pagos_payment_reported, Snackbar.LENGTH_SHORT).show()
            }
        }
        dialog.show()
    }

    private fun selectedMethod(checkedId: Int): String = when (checkedId) {
        R.id.option_card_payment -> getString(R.string.pagos_method_card)
        R.id.option_cash_payment -> getString(R.string.pagos_method_cash)
        else -> getString(R.string.pagos_method_transfer)
    }

    override fun onDestroyView() {
        binding.recyclerPendingPayments.adapter = null
        binding.recyclerPaidPayments.adapter = null
        _binding = null
        super.onDestroyView()
    }

    private val Int.dp: Int
        get() = (this * resources.displayMetrics.density).toInt()

    private companion object {
        val currency: NumberFormat = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("es-GT"))
        val dateFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.forLanguageTag("es-GT"))
    }
}