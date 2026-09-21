package com.wave.gt.ortos.ui.perfil

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wave.gt.ortos.ui.perfil.domain.GetPatientProfileUseCase
import com.wave.gt.ortos.ui.perfil.domain.PatientProfile
import com.wave.gt.ortos.ui.perfil.domain.UpdatePatientProfileUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class PerfilViewModel(
    private val getPatientProfile: GetPatientProfileUseCase,
    private val updatePatientProfile: UpdatePatientProfileUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(PerfilUiState())
    val uiState: StateFlow<PerfilUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, hasError = false) }
        viewModelScope.launch {
            runCatching { getPatientProfile() }
                .onSuccess { profile ->
                    _uiState.value = PerfilUiState(
                        isLoading = false,
                        profile = profile,
                        hasError = profile == null
                    )
                }
                .onFailure {
                    _uiState.value = PerfilUiState(isLoading = false, hasError = true)
                }
        }
    }

    fun startEditing() {
        _uiState.update { it.copy(isEditing = true, validationError = null, saved = false) }
    }

    fun cancelEditing() {
        _uiState.update { it.copy(isEditing = false, validationError = null, saved = false) }
    }

    fun save(profile: PatientProfile) {
        val validationError = when {
            profile.fullName.isBlank() -> ProfileValidationError.NAME_REQUIRED
            !profile.phone.matches(PHONE_PATTERN) -> ProfileValidationError.PHONE_INVALID
            !profile.contactEmail.matches(EMAIL_PATTERN) ->
                ProfileValidationError.EMAIL_INVALID
            else -> null
        }
        if (validationError != null) {
            _uiState.update { it.copy(validationError = validationError) }
            return
        }

        _uiState.update { it.copy(isSaving = true, validationError = null, saved = false) }
        viewModelScope.launch {
            runCatching { updatePatientProfile(profile) }
                .onSuccess { savedProfile ->
                    _uiState.value = PerfilUiState(
                        isLoading = false,
                        profile = savedProfile,
                        saved = true
                    )
                }
                .onFailure {
                    _uiState.update { it.copy(isSaving = false, hasError = true) }
                }
        }
    }

    fun consumeSaved() {
        _uiState.update { it.copy(saved = false) }
    }

    private companion object {
        val PHONE_PATTERN = Regex("^[0-9+() -]{8,20}$")
        val EMAIL_PATTERN = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
    }
}
