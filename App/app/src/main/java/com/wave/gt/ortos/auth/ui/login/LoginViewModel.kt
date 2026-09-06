package com.wave.gt.ortos.auth.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wave.gt.ortos.auth.domain.usecase.GetRememberedEmailUseCase
import com.wave.gt.ortos.auth.domain.usecase.GoogleLoginResult
import com.wave.gt.ortos.auth.domain.usecase.LoginResult
import com.wave.gt.ortos.auth.domain.usecase.LoginWithEmailUseCase
import com.wave.gt.ortos.auth.domain.usecase.LoginWithGoogleUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class LoginViewModel(
    private val loginWithEmail: LoginWithEmailUseCase,
    private val loginWithGoogle: LoginWithGoogleUseCase,
    getRememberedEmail: GetRememberedEmailUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(initialState(getRememberedEmail()))
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun onEmailChange(value: String) {
        _uiState.update { it.copy(email = value, emailError = null, errorType = null) }
    }

    fun onPasswordChange(value: String) {
        _uiState.update { it.copy(password = value, passwordError = null, errorType = null) }
    }

    fun onRememberUserChange(value: Boolean) {
        _uiState.update { it.copy(rememberUser = value) }
    }

    fun submit() {
        val current = _uiState.value
        if (current.isLoading) return
        _uiState.update {
            it.copy(isLoading = true, emailError = null, passwordError = null, errorType = null)
        }
        viewModelScope.launch {
            when (val result = loginWithEmail(current.email, current.password, current.rememberUser)) {
                is LoginResult.Success ->
                    _uiState.update { it.copy(isLoading = false, authenticated = true) }
                is LoginResult.InvalidInput ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            emailError = result.emailError,
                            passwordError = result.passwordError
                        )
                    }
                is LoginResult.Failure ->
                    _uiState.update { it.copy(isLoading = false, errorType = result.type) }
            }
        }
    }

    fun signInWithGoogle(idToken: String?) {
        if (_uiState.value.isLoading) return
        _uiState.update { it.copy(isLoading = true, errorType = null) }
        viewModelScope.launch {
            when (val result = loginWithGoogle(idToken)) {
                is GoogleLoginResult.Success ->
                    _uiState.update { it.copy(isLoading = false, authenticated = true) }
                is GoogleLoginResult.Failure ->
                    _uiState.update { it.copy(isLoading = false, errorType = result.type) }
            }
        }
    }

    fun errorShown() {
        _uiState.update { it.copy(errorType = null) }
    }

    private fun initialState(rememberedEmail: String?) = LoginUiState(
        email = rememberedEmail.orEmpty(),
        rememberUser = rememberedEmail != null
    )
}
