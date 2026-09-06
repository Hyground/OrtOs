package com.wave.gt.ortos.auth.ui.recover

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wave.gt.ortos.auth.domain.usecase.RecoverPasswordResult
import com.wave.gt.ortos.auth.domain.usecase.RecoverPasswordUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class RecoverPasswordViewModel(
    private val recoverPassword: RecoverPasswordUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(RecoverPasswordUiState())
    val uiState: StateFlow<RecoverPasswordUiState> = _uiState.asStateFlow()

    fun onEmailChange(value: String) {
        _uiState.update { it.copy(email = value, emailError = null, errorType = null) }
    }

    fun submit() {
        val current = _uiState.value
        if (current.isLoading) return
        _uiState.update { it.copy(isLoading = true, emailError = null, errorType = null) }
        viewModelScope.launch {
            when (val result = recoverPassword(current.email)) {
                RecoverPasswordResult.Success ->
                    _uiState.update { it.copy(isLoading = false, emailSent = true) }
                is RecoverPasswordResult.InvalidInput ->
                    _uiState.update { it.copy(isLoading = false, emailError = result.emailError) }
                is RecoverPasswordResult.Failure ->
                    _uiState.update { it.copy(isLoading = false, errorType = result.type) }
            }
        }
    }

    fun errorShown() {
        _uiState.update { it.copy(errorType = null) }
    }
}
