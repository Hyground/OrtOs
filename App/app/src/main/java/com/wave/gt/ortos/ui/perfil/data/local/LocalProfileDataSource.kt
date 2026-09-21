package com.wave.gt.ortos.ui.perfil.data.local

import com.wave.gt.ortos.auth.domain.AuthUser
import com.wave.gt.ortos.ui.perfil.domain.PatientProfile
import kotlinx.coroutines.delay

class LocalProfileDataSource {

    private var profile = PatientProfile(
        patientId = "patient-1",
        fullName = "María Fernanda López García",
        dpi = "3170626701302",
        birthDate = "15/05/1995",
        phone = "5555-1234",
        contactEmail = "marifer26452@gmail.com",
        address = "Zona 1, Huehuetenango",
        municipality = "Huehuetenango",
        accessEmail = "",
        folio = "EXP-2026-00128",
        status = "Activo"
    )

    suspend fun getProfile(user: AuthUser): PatientProfile {
        delay(RESPONSE_DELAY_MS)
        return profile.copy(accessEmail = user.email)
    }

    suspend fun updateProfile(profile: PatientProfile): PatientProfile {
        delay(RESPONSE_DELAY_MS)
        this.profile = profile.copy(
            fullName = profile.fullName.trim(),
            birthDate = profile.birthDate.trim(),
            phone = profile.phone.trim(),
            contactEmail = profile.contactEmail.trim(),
            address = profile.address.trim(),
            municipality = profile.municipality.trim()
        )
        return this.profile
    }

    private companion object {
        const val RESPONSE_DELAY_MS = 250L
    }
}
