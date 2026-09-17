package com.wave.gt.ortos.pagos.ui

import com.wave.gt.ortos.pagos.domain.PaymentDashboard

data class PagosUiState(
    val isLoading: Boolean = true,
    val dashboard: PaymentDashboard? = null
)
