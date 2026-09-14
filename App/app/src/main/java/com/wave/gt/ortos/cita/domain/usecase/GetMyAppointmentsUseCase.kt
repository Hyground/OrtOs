package com.wave.gt.ortos.cita.domain.usecase

import com.wave.gt.ortos.cita.domain.CitaRepository

class GetMyAppointmentsUseCase(
    private val repository: CitaRepository
) {
    suspend operator fun invoke() = repository.getMyAppointments()
}