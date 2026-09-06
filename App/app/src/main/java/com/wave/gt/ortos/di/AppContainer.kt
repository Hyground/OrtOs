package com.wave.gt.ortos.di

import android.content.Context
import com.wave.gt.ortos.auth.data.AuthRepositoryImpl
import com.wave.gt.ortos.auth.data.fake.FakeAuthDataSource
import com.wave.gt.ortos.auth.data.local.SessionManager
import com.wave.gt.ortos.auth.data.remote.RemoteAuthDataSource
import com.wave.gt.ortos.auth.domain.AuthRepository
import com.wave.gt.ortos.auth.domain.usecase.GetRememberedEmailUseCase
import com.wave.gt.ortos.auth.domain.usecase.LoginWithEmailUseCase
import com.wave.gt.ortos.auth.domain.usecase.LoginWithGoogleUseCase
import com.wave.gt.ortos.auth.domain.usecase.RecoverPasswordUseCase

class AppContainer(context: Context) {

    private val appContext = context.applicationContext

    val sessionManager: SessionManager by lazy { SessionManager(appContext) }

    private val remoteAuthDataSource by lazy { RemoteAuthDataSource(api = null) }

    private val fakeAuthDataSource by lazy { FakeAuthDataSource() }

    val authRepository: AuthRepository by lazy {
        AuthRepositoryImpl(
            remote = remoteAuthDataSource,
            fake = fakeAuthDataSource,
            session = sessionManager,
            useFakeBackend = USE_FAKE_BACKEND
        )
    }

    val loginWithEmailUseCase: LoginWithEmailUseCase
        get() = LoginWithEmailUseCase(authRepository)

    val loginWithGoogleUseCase: LoginWithGoogleUseCase
        get() = LoginWithGoogleUseCase(authRepository)

    val getRememberedEmailUseCase: GetRememberedEmailUseCase
        get() = GetRememberedEmailUseCase(authRepository)

    val recoverPasswordUseCase: RecoverPasswordUseCase
        get() = RecoverPasswordUseCase(authRepository)

    private companion object {
        const val USE_FAKE_BACKEND = true
    }
}
