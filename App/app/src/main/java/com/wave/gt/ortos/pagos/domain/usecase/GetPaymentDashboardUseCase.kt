package com.wave.gt.ortos.pagos.domain.usecase

import com.wave.gt.ortos.pagos.domain.PagosRepository

class GetPaymentDashboardUseCase(
    private val repository: PagosRepository
) {
    suspend operator fun invoke() = repository.getPaymentDashboard()
}
