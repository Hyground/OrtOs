package com.wave.gt.ortos.auth.ui.recover

import com.wave.gt.ortos.auth.domain.AuthErrorType
import com.wave.gt.ortos.auth.domain.ValidationError

data class RecoverPasswordUiState(
    val email: String = "",
    val emailError: ValidationError? = null,
    val isLoading: Boolean = false,
    val emailSent: Boolean = false,
    val errorType: AuthErrorType? = null
)
