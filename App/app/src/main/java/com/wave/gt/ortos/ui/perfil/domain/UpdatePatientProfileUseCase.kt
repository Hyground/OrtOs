package com.wave.gt.ortos.ui.perfil.domain

class UpdatePatientProfileUseCase(
    private val repository: ProfileRepository
) {
    suspend operator fun invoke(profile: PatientProfile): PatientProfile = repository.updateProfile(profile)
}
