package com.wave.gt.ortos.ui.perfil.data

import com.wave.gt.ortos.auth.data.local.SessionManager
import com.wave.gt.ortos.ui.perfil.data.local.LocalProfileDataSource
import com.wave.gt.ortos.ui.perfil.domain.PatientProfile
import com.wave.gt.ortos.ui.perfil.domain.ProfileRepository

class ProfileRepositoryImpl(
    private val local: LocalProfileDataSource,
    private val session: SessionManager
) : ProfileRepository {

    override suspend fun getCurrentProfile(): PatientProfile? {
        val user = session.currentUser() ?: return null
        return local.getProfile(user)
    }

    override suspend fun updateProfile(profile: PatientProfile): PatientProfile =
        local.updateProfile(profile)
}
