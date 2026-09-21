package com.wave.gt.ortos.ui.perfil.domain

interface ProfileRepository {
    suspend fun getCurrentProfile(): PatientProfile?
    suspend fun updateProfile(profile: PatientProfile): PatientProfile
}
