package com.wave.gt.ortos.auth.domain

data class AuthUser(
    val id: String,
    val email: String,
    val displayName: String,
    val provider: AuthProvider
)

enum class AuthProvider {
    EMAIL,
    GOOGLE
}

sealed interface Outcome<out T> {
    data class Success<T>(val value: T) : Outcome<T>
    data class Error(val type: AuthErrorType) : Outcome<Nothing>
}

enum class AuthErrorType {
    INVALID_CREDENTIALS,
    EMAIL_NOT_FOUND,
    GOOGLE_SIGN_IN_FAILED,
    NETWORK,
    UNKNOWN
}

enum class ValidationError {
    EMPTY,
    INVALID_EMAIL_FORMAT,
    PASSWORD_TOO_SHORT,
    PASSWORD_WEAK
}

sealed interface FieldValidation {
    data object Valid : FieldValidation
    data class Invalid(val reason: ValidationError) : FieldValidation
}
