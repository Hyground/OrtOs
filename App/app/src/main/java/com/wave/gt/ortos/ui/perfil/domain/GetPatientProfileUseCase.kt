package com.wave.gt.ortos.ui.perfil.domain

class GetPatientProfileUseCase(
    private val repository: ProfileRepository
) {
    suspend operator fun invoke(): PatientProfile? = repository.getCurrentProfile()
}
