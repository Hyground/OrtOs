package com.wave.gt.ortos.auth.ui

import androidx.annotation.StringRes
import com.wave.gt.ortos.R
import com.wave.gt.ortos.auth.domain.AuthErrorType
import com.wave.gt.ortos.auth.domain.ValidationError

@StringRes
fun ValidationError.toEmailMessage(): Int = when (this) {
    ValidationError.EMPTY -> R.string.error_email_required
    ValidationError.INVALID_EMAIL_FORMAT -> R.string.error_email_invalid
    ValidationError.PASSWORD_TOO_SHORT,
    ValidationError.PASSWORD_WEAK -> R.string.error_email_invalid
}

@StringRes
fun ValidationError.toPasswordMessage(): Int = when (this) {
    ValidationError.EMPTY -> R.string.error_password_required
    ValidationError.PASSWORD_TOO_SHORT -> R.string.error_password_too_short
    ValidationError.PASSWORD_WEAK -> R.string.error_password_weak
    ValidationError.INVALID_EMAIL_FORMAT -> R.string.error_password_weak
}

@StringRes
fun AuthErrorType.toMessage(): Int = when (this) {
    AuthErrorType.INVALID_CREDENTIALS -> R.string.error_invalid_credentials
    AuthErrorType.EMAIL_NOT_FOUND -> R.string.error_email_not_found
    AuthErrorType.GOOGLE_SIGN_IN_FAILED -> R.string.error_google_sign_in
    AuthErrorType.NETWORK -> R.string.error_network
    AuthErrorType.UNKNOWN -> R.string.error_unknown
}
