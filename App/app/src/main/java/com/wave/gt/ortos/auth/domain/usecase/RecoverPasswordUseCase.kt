package com.wave.gt.ortos.auth.domain.usecase

import com.wave.gt.ortos.auth.domain.AuthErrorType
import com.wave.gt.ortos.auth.domain.AuthRepository
import com.wave.gt.ortos.auth.domain.EmailValidator
import com.wave.gt.ortos.auth.domain.FieldValidation
import com.wave.gt.ortos.auth.domain.Outcome
import com.wave.gt.ortos.auth.domain.ValidationError

sealed interface RecoverPasswordResult {
    data object Success : RecoverPasswordResult
    data class InvalidInput(val emailError: ValidationError) : RecoverPasswordResult
    data class Failure(val type: AuthErrorType) : RecoverPasswordResult
}

class RecoverPasswordUseCase(
    private val repository: AuthRepository
) {

    suspend operator fun invoke(rawEmail: String): RecoverPasswordResult {
        val email = rawEmail.trim()
        when (val validation = EmailValidator.validate(email)) {
            is FieldValidation.Invalid -> return RecoverPasswordResult.InvalidInput(validation.reason)
            FieldValidation.Valid -> Unit
        }

        return when (val outcome = repository.sendPasswordReset(email)) {
            is Outcome.Success -> RecoverPasswordResult.Success
            is Outcome.Error -> RecoverPasswordResult.Failure(outcome.type)
        }
    }
}
