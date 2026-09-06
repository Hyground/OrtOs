package com.wave.gt.ortos.auth.domain

interface AuthRepository {

    suspend fun loginWithEmail(
        email: String,
        password: String,
        rememberUser: Boolean
    ): Outcome<AuthUser>

    suspend fun loginWithGoogle(idToken: String?): Outcome<AuthUser>

    suspend fun sendPasswordReset(email: String): Outcome<Unit>

    fun rememberedEmail(): String?

    fun currentUser(): AuthUser?

    fun logout()
}
