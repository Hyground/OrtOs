package com.wave.gt.ortos.auth.domain.usecase

import com.wave.gt.ortos.auth.domain.AuthErrorType
import com.wave.gt.ortos.auth.domain.AuthRepository
import com.wave.gt.ortos.auth.domain.AuthUser
import com.wave.gt.ortos.auth.domain.Outcome

sealed interface GoogleLoginResult {
    data class Success(val user: AuthUser) : GoogleLoginResult
    data class Failure(val type: AuthErrorType) : GoogleLoginResult
}

class LoginWithGoogleUseCase(
    private val repository: AuthRepository
) {

    suspend operator fun invoke(idToken: String?): GoogleLoginResult {
        return when (val outcome = repository.loginWithGoogle(idToken)) {
            is Outcome.Success -> GoogleLoginResult.Success(outcome.value)
            is Outcome.Error -> GoogleLoginResult.Failure(outcome.type)
        }
    }
}
