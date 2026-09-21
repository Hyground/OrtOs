package com.wave.gt.ortos.ui.perfil.domain

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Test

class PatientProfileTest {

    private val profile = PatientProfile(
        patientId = "patient-1",
        fullName = "María Fernanda López García",
        dpi = "3170626701302",
        birthDate = "15/05/1995",
        phone = "5555-1234",
        contactEmail = "marifer26452@gmail.com",
        address = "Zona 1, Huehuetenango",
        municipality = "Huehuetenango",
        accessEmail = "demo@ortos.com",
        folio = "EXP-2026-00128",
        status = "Activo"
    )

    @Test
    fun `initials use the first two names`() {
        assertEquals("MF", profile.initials)
    }

    @Test
    fun `use case returns the current patient profile`() = runTest {
        val repository = object : ProfileRepository {
            override suspend fun getCurrentProfile(): PatientProfile = profile
            override suspend fun updateProfile(profile: PatientProfile): PatientProfile = profile
        }

        assertSame(profile, GetPatientProfileUseCase(repository)())
    }
}
