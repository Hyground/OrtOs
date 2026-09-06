package com.wave.gt.ortos.auth.data.remote

data class LoginRequestDto(
    val email: String,
    val password: String
)

data class GoogleLoginRequestDto(
    val idToken: String
)

data class PasswordResetRequestDto(
    val email: String
)

data class AuthUserDto(
    val id: String,
    val email: String,
    val displayName: String
)

data class AuthResponseDto(
    val token: String,
    val user: AuthUserDto
)

interface AuthApi {

    suspend fun login(request: LoginRequestDto): AuthResponseDto

    suspend fun loginWithGoogle(request: GoogleLoginRequestDto): AuthResponseDto

    suspend fun requestPasswordReset(request: PasswordResetRequestDto)
}
