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
import com.wave.gt.ortos.cita.data.CitaRepositoryImpl
import com.wave.gt.ortos.cita.data.local.LocalCitaDataSource
import com.wave.gt.ortos.cita.domain.CitaRepository
import com.wave.gt.ortos.cita.domain.usecase.GetMyAppointmentsUseCase
import com.wave.gt.ortos.chat.data.ChatRepositoryImpl
import com.wave.gt.ortos.chat.data.local.LocalChatDataSource
import com.wave.gt.ortos.chat.domain.ChatRepository
import com.wave.gt.ortos.chat.domain.usecase.ObserveMessagesUseCase
import com.wave.gt.ortos.chat.domain.usecase.SendMessageUseCase
import com.wave.gt.ortos.home.data.HomeRepositoryImpl
import com.wave.gt.ortos.home.data.local.LocalHomeDataSource
import com.wave.gt.ortos.home.domain.HomeRepository
import com.wave.gt.ortos.home.domain.usecase.GetHomeDashboardUseCase
import com.wave.gt.ortos.pagos.data.PagosRepositoryImpl
import com.wave.gt.ortos.pagos.data.local.LocalPagosDataSource
import com.wave.gt.ortos.pagos.domain.PagosRepository
import com.wave.gt.ortos.pagos.domain.usecase.GetPaymentDashboardUseCase
import com.wave.gt.ortos.ui.perfil.data.ProfileRepositoryImpl
import com.wave.gt.ortos.ui.perfil.data.local.LocalProfileDataSource
import com.wave.gt.ortos.ui.perfil.domain.GetPatientProfileUseCase
import com.wave.gt.ortos.ui.perfil.domain.ProfileRepository
import com.wave.gt.ortos.ui.perfil.domain.UpdatePatientProfileUseCase

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

    private val localCitaDataSource by lazy { LocalCitaDataSource() }

    private val citaRepository: CitaRepository by lazy { CitaRepositoryImpl(localCitaDataSource) }

    val getMyAppointmentsUseCase: GetMyAppointmentsUseCase
        get() = GetMyAppointmentsUseCase(citaRepository)

    private val localPagosDataSource by lazy { LocalPagosDataSource() }

    private val pagosRepository: PagosRepository by lazy { PagosRepositoryImpl(localPagosDataSource) }

    val getPaymentDashboardUseCase: GetPaymentDashboardUseCase
        get() = GetPaymentDashboardUseCase(pagosRepository)

    private val localChatDataSource by lazy { LocalChatDataSource() }

    private val chatRepository: ChatRepository by lazy { ChatRepositoryImpl(localChatDataSource) }

    val observeMessagesUseCase: ObserveMessagesUseCase
        get() = ObserveMessagesUseCase(chatRepository)

    val sendMessageUseCase: SendMessageUseCase
        get() = SendMessageUseCase(chatRepository)

    private val localProfileDataSource by lazy { LocalProfileDataSource() }

    private val profileRepository: ProfileRepository by lazy {
        ProfileRepositoryImpl(localProfileDataSource, sessionManager)
    }

    val getPatientProfileUseCase: GetPatientProfileUseCase
        get() = GetPatientProfileUseCase(profileRepository)

    val updatePatientProfileUseCase: UpdatePatientProfileUseCase
        get() = UpdatePatientProfileUseCase(profileRepository)

    private companion object {
        const val USE_LOCAL_BACKEND = true
    }
}
