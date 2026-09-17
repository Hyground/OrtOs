package com.wave.gt.ortos.pagos.data

import com.wave.gt.ortos.pagos.data.local.LocalPagosDataSource
import com.wave.gt.ortos.pagos.domain.PagosRepository

class PagosRepositoryImpl(
    private val local: LocalPagosDataSource
) : PagosRepository {

    override suspend fun getPaymentDashboard() = local.getPaymentDashboard()
}
