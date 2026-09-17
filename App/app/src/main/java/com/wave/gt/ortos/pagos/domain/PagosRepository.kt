package com.wave.gt.ortos.pagos.domain

interface PagosRepository {
    suspend fun getPaymentDashboard(): PaymentDashboard
}
