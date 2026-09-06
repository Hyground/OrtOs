package com.wave.gt.ortos.auth.data.fake

import com.wave.gt.ortos.auth.domain.AuthErrorType
import com.wave.gt.ortos.auth.domain.AuthProvider
import com.wave.gt.ortos.auth.domain.AuthUser
import com.wave.gt.ortos.auth.domain.Outcome
import kotlinx.coroutines.delay
import java.util.UUID

class FakeAuthDataSource {

    private data class FakeAccount(
        val id: String,
        val email: String,
        val password: String,
        val displayName: String
    )

    private val accounts = mutableListOf(
        FakeAccount(
            id = "u-001",
            email = "demo@ortos.com",
            password = "Ortos123",
            displayName = "Usuario Demo"
        )
    )

    suspend fun loginWithEmail(email: String, password: String): Outcome<AuthUser> {
        delay(NETWORK_DELAY_MS)
        val account = accounts.firstOrNull { it.email.equals(email, ignoreCase = true) }
            ?: return Outcome.Error(AuthErrorType.INVALID_CREDENTIALS)
        if (account.password != password) {
            return Outcome.Error(AuthErrorType.INVALID_CREDENTIALS)
        }
        return Outcome.Success(account.toDomain(AuthProvider.EMAIL))
    }

    suspend fun loginWithGoogle(idToken: String?): Outcome<AuthUser> {
        delay(NETWORK_DELAY_MS)
        val user = AuthUser(
            id = "g-${UUID.randomUUID()}",
            email = "google.user@ortos.com",
            displayName = "Usuario Google",
            provider = AuthProvider.GOOGLE
        )
        return Outcome.Success(user)
    }

    suspend fun sendPasswordReset(email: String): Outcome<Unit> {
        delay(NETWORK_DELAY_MS)
        return Outcome.Success(Unit)
    }

    private fun FakeAccount.toDomain(provider: AuthProvider) = AuthUser(
        id = id,
        email = email,
        displayName = displayName,
        provider = provider
    )

    private companion object {
        const val NETWORK_DELAY_MS = 900L
    }
}
