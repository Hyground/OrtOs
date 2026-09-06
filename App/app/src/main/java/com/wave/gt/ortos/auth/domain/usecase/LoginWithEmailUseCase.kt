package com.wave.gt.ortos.auth.domain.usecase

import com.wave.gt.ortos.auth.domain.AuthErrorType
import com.wave.gt.ortos.auth.domain.AuthRepository
import com.wave.gt.ortos.auth.domain.AuthUser
import com.wave.gt.ortos.auth.domain.EmailValidator
import com.wave.gt.ortos.auth.domain.FieldValidation
import com.wave.gt.ortos.auth.domain.Outcome
import com.wave.gt.ortos.auth.domain.PasswordValidator
import com.wave.gt.ortos.auth.domain.ValidationError

sealed interface LoginResult {
    data class Success(val user: AuthUser) : LoginResult
    data class InvalidInput(
        val emailError: ValidationError?,
        val passwordError: ValidationError?
    ) : LoginResult
    data class Failure(val type: AuthErrorType) : LoginResult
}

class LoginWithEmailUseCase(
    private val repository: AuthRepository
) {

    suspend operator fun invoke(
        rawEmail: String,
        rawPassword: String,
        rememberUser: Boolean
    ): LoginResult {
        val email = rawEmail.trim()
        val emailValidation = EmailValidator.validate(email)
        val passwordValidation = PasswordValidator.validate(rawPassword)

        if (emailValidation is FieldValidation.Invalid || passwordValidation is FieldValidation.Invalid) {
            return LoginResult.InvalidInput(
                emailError = (emailValidation as? FieldValidation.Invalid)?.reason,
                passwordError = (passwordValidation as? FieldValidation.Invalid)?.reason
            )
        }

        return when (val outcome = repository.loginWithEmail(email, rawPassword, rememberUser)) {
            is Outcome.Success -> LoginResult.Success(outcome.value)
            is Outcome.Error -> LoginResult.Failure(outcome.type)
        }
    }
}
