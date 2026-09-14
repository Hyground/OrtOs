package com.wave.gt.ortos.cita.data

import com.wave.gt.ortos.cita.data.local.LocalCitaDataSource
import com.wave.gt.ortos.cita.domain.CitaRepository

class CitaRepositoryImpl(
    private val local: LocalCitaDataSource
) : CitaRepository {

    override suspend fun getMyAppointments() = local.getMyAppointments()
}