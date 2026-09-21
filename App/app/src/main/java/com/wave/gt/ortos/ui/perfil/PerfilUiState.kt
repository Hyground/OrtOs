package com.wave.gt.ortos.ui.perfil

import com.wave.gt.ortos.ui.perfil.domain.PatientProfile

data class PerfilUiState(
    val isLoading: Boolean = true,
    val isSaving: Boolean = false,
    val isEditing: Boolean = false,
    val profile: PatientProfile? = null,
    val hasError: Boolean = false,
    val validationError: ProfileValidationError? = null,
    val saved: Boolean = false
)

enum class ProfileValidationError {
    NAME_REQUIRED,
    PHONE_INVALID,
    EMAIL_INVALID
}
