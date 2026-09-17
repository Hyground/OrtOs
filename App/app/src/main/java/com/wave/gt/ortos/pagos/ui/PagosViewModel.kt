package com.wave.gt.ortos.pagos.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wave.gt.ortos.pagos.domain.PatientPayment
import com.wave.gt.ortos.pagos.domain.PaymentStatus
import com.wave.gt.ortos.pagos.domain.usecase.GetPaymentDashboardUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate

class PagosViewModel(
    private val getPaymentDashboard: GetPaymentDashboardUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(PagosUiState())
    val uiState: StateFlow<PagosUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            _uiState.update {
                it.copy(isLoading = false, dashboard = getPaymentDashboard())
            }
        }
    }

    fun reportPayment(payment: PatientPayment, amount: Double, method: String, reference: String) {
        _uiState.update { state ->
            val dashboard = state.dashboard ?: return@update state
            val report = PatientPayment(
                id = "report-${payment.id}-${System.currentTimeMillis()}",
                concept = "Comprobante: ${payment.concept}",
                amount = amount.coerceAtMost(payment.amount),
                dueDate = payment.dueDate,
                paidDate = LocalDate.now(),
                methodLabel = "$method - Ref. $reference",
                status = PaymentStatus.InReview
            )
            state.copy(dashboard = dashboard.copy(payments = dashboard.payments + report))
        }
    }
}