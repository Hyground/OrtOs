package com.wave.gt.ortos.auth.data

import com.wave.gt.ortos.auth.data.fake.FakeAuthDataSource
import com.wave.gt.ortos.auth.data.local.SessionManager
import com.wave.gt.ortos.auth.data.remote.RemoteAuthDataSource
import com.wave.gt.ortos.auth.domain.AuthErrorType
import com.wave.gt.ortos.auth.domain.AuthRepository
import com.wave.gt.ortos.auth.domain.AuthUser
import com.wave.gt.ortos.auth.domain.Outcome
import kotlinx.coroutines.CancellationException
import java.io.IOException

class AuthRepositoryImpl(
    private val remote: RemoteAuthDataSource,
    private val fake: FakeAuthDataSource,
    private val session: SessionManager,
    private val useFakeBackend: Boolean
) : AuthRepository {

    override suspend fun loginWithEmail(email: String, password: String): Outcome<AuthUser> {
        val outcome = runCatching {
            if (useFakeBackend) {
                fake.loginWithEmail(email, password)
            } else {
                Outcome.Success(remote.loginWithEmail(email, password))
            }
        }.getOrElse { return it.toOutcome() }

        if (outcome is Outcome.Success) session.save(outcome.value)
        return outcome
    }

    override suspend fun loginWithGoogle(idToken: String?): Outcome<AuthUser> {
        val outcome = runCatching {
            if (useFakeBackend) {
                fake.loginWithGoogle(idToken)
            } else {
                val token = idToken ?: return Outcome.Error(AuthErrorType.GOOGLE_SIGN_IN_FAILED)
                Outcome.Success(remote.loginWithGoogle(token))
            }
        }.getOrElse { return it.toOutcome() }

        if (outcome is Outcome.Success) session.save(outcome.value)
        return outcome
    }

    override suspend fun sendPasswordReset(email: String): Outcome<Unit> {
        return runCatching {
            if (useFakeBackend) {
                fake.sendPasswordReset(email)
            } else {
                remote.sendPasswordReset(email)
                Outcome.Success(Unit)
            }
        }.getOrElse { it.toOutcome() }
    }

    override fun currentUser(): AuthUser? = session.currentUser()

    override fun logout() = session.clear()

    private fun Throwable.toOutcome(): Outcome<Nothing> {
        if (this is CancellationException) throw this
        val type = if (this is IOException) AuthErrorType.NETWORK else AuthErrorType.UNKNOWN
        return Outcome.Error(type)
    }
}
