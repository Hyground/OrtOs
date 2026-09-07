package com.wave.gt.ortos.di

import android.content.Context
import com.wave.gt.ortos.auth.data.AuthRepositoryImpl
import com.wave.gt.ortos.auth.data.local.LocalAuthDataSource
import com.wave.gt.ortos.auth.data.local.SessionManager
import com.wave.gt.ortos.auth.data.remote.RemoteAuthDataSource
import com.wave.gt.ortos.auth.domain.AuthRepository
import com.wave.gt.ortos.auth.domain.usecase.GetRememberedEmailUseCase
import com.wave.gt.ortos.auth.domain.usecase.LoginWithEmailUseCase
import com.wave.gt.ortos.auth.domain.usecase.LoginWithGoogleUseCase
import com.wave.gt.ortos.auth.domain.usecase.RecoverPasswordUseCase
import com.wave.gt.ortos.chat.data.ChatRepositoryImpl
import com.wave.gt.ortos.chat.data.local.LocalChatDataSource
import com.wave.gt.ortos.chat.domain.ChatRepository
import com.wave.gt.ortos.chat.domain.usecase.ObserveMessagesUseCase
import com.wave.gt.ortos.chat.domain.usecase.SendMessageUseCase
import com.wave.gt.ortos.home.data.HomeRepositoryImpl
import com.wave.gt.ortos.home.data.local.LocalHomeDataSource
import com.wave.gt.ortos.home.domain.HomeRepository
import com.wave.gt.ortos.home.domain.usecase.GetHomeDashboardUseCase

class AppContainer(context: Context) {

    private val appContext = context.applicationContext

    val sessionManager: SessionManager by lazy { SessionManager(appContext) }

    private val remoteAuthDataSource by lazy { RemoteAuthDataSource(api = null) }

    private val localAuthDataSource by lazy { LocalAuthDataSource() }

    private val authRepository: AuthRepository by lazy {
        AuthRepositoryImpl(
            remote = remoteAuthDataSource,
            local = localAuthDataSource,
            session = sessionManager,
            useLocalBackend = USE_LOCAL_BACKEND
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

    private val localHomeDataSource by lazy { LocalHomeDataSource() }

    private val homeRepository: HomeRepository by lazy { HomeRepositoryImpl(localHomeDataSource) }

    val getHomeDashboardUseCase: GetHomeDashboardUseCase
        get() = GetHomeDashboardUseCase(homeRepository)

    private val localChatDataSource by lazy { LocalChatDataSource() }

    private val chatRepository: ChatRepository by lazy { ChatRepositoryImpl(localChatDataSource) }

    val observeMessagesUseCase: ObserveMessagesUseCase
        get() = ObserveMessagesUseCase(chatRepository)

    val sendMessageUseCase: SendMessageUseCase
        get() = SendMessageUseCase(chatRepository)

    private companion object {
        const val USE_LOCAL_BACKEND = true
    }
}
