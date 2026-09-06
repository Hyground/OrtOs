package com.wave.gt.ortos.auth.ui.login

import com.wave.gt.ortos.auth.domain.AuthErrorType
import com.wave.gt.ortos.auth.domain.ValidationError

data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val rememberUser: Boolean = false,
    val emailError: ValidationError? = null,
    val passwordError: ValidationError? = null,
    val isLoading: Boolean = false,
    val authenticated: Boolean = false,
    val errorType: AuthErrorType? = null
)
