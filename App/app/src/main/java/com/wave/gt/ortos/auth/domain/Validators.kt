package com.wave.gt.ortos.auth.domain

object AuthRules {
    const val MIN_PASSWORD_LENGTH = 8
}

object EmailValidator {

    private val EMAIL_REGEX = Regex(
        "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    )

    fun validate(email: String): FieldValidation {
        val value = email.trim()
        return when {
            value.isEmpty() -> FieldValidation.Invalid(ValidationError.EMPTY)
            !EMAIL_REGEX.matches(value) -> FieldValidation.Invalid(ValidationError.INVALID_EMAIL_FORMAT)
            else -> FieldValidation.Valid
        }
    }
}

object PasswordValidator {

    fun validate(password: String): FieldValidation {
        return when {
            password.isEmpty() -> FieldValidation.Invalid(ValidationError.EMPTY)
            password.length < AuthRules.MIN_PASSWORD_LENGTH ->
                FieldValidation.Invalid(ValidationError.PASSWORD_TOO_SHORT)
            !password.any { it.isDigit() } || !password.any { it.isLetter() } ->
                FieldValidation.Invalid(ValidationError.PASSWORD_WEAK)
            else -> FieldValidation.Valid
        }
    }
}
