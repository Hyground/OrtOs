package com.wave.gt.ortos.auth.data.remote

import com.wave.gt.ortos.auth.domain.AuthProvider
import com.wave.gt.ortos.auth.domain.AuthUser

class RemoteAuthDataSource(
    private val api: AuthApi?
) {

    private fun requireApi(): AuthApi = api
        ?: throw IllegalStateException("AuthApi no configurada todavia")

    suspend fun loginWithEmail(email: String, password: String): AuthUser {
        val response = requireApi().login(LoginRequestDto(email, password))
        return response.user.toDomain(AuthProvider.EMAIL)
    }

    suspend fun loginWithGoogle(idToken: String): AuthUser {
        val response = requireApi().loginWithGoogle(GoogleLoginRequestDto(idToken))
        return response.user.toDomain(AuthProvider.GOOGLE)
    }

    suspend fun sendPasswordReset(email: String) {
        requireApi().requestPasswordReset(PasswordResetRequestDto(email))
    }

    private fun AuthUserDto.toDomain(provider: AuthProvider) = AuthUser(
        id = id,
        email = email,
        displayName = displayName,
        provider = provider
    )
}
