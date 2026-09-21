package com.wave.gt.ortos.ui.perfil

import android.os.Bundle
import android.graphics.Rect
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.ViewCompat
import androidx.core.view.updatePadding
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputLayout
import com.wave.gt.ortos.R
import com.wave.gt.ortos.databinding.FragmentPerfilBinding
import com.wave.gt.ortos.di.ViewModelFactory
import com.wave.gt.ortos.di.appContainer
import com.wave.gt.ortos.ui.perfil.domain.PatientProfile
import kotlinx.coroutines.launch

class PerfilFragment : Fragment(R.layout.fragment_perfil) {

    private var _binding: FragmentPerfilBinding? = null
    private val binding get() = _binding!!

    private val viewModel: PerfilViewModel by viewModels {
        ViewModelFactory {
            PerfilViewModel(
                appContainer.getPatientProfileUseCase,
                appContainer.updatePatientProfileUseCase
            )
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentPerfilBinding.bind(view)
        configureKeyboardInsets()
        binding.displayName.setOnClickListener { beginEditing(binding.layoutName, binding.valueName, R.string.profile_name) }
        binding.displayBirthDate.setOnClickListener { beginEditing(binding.layoutBirthDate, binding.valueBirthDate, R.string.profile_birth_date) }
        binding.displayPhone.setOnClickListener { beginEditing(binding.layoutPhone, binding.valuePhone, R.string.profile_phone) }
        binding.displayContactEmail.setOnClickListener { beginEditing(binding.layoutContactEmail, binding.valueContactEmail, R.string.profile_contact_email) }
        binding.displayAddress.setOnClickListener { beginEditing(binding.layoutAddress, binding.valueAddress, R.string.profile_address) }
        binding.displayMunicipality.setOnClickListener { beginEditing(binding.layoutMunicipality, binding.valueMunicipality, R.string.profile_municipality) }
        binding.buttonCancel.setOnClickListener {
            hideKeyboard()
            viewModel.cancelEditing()
            viewModel.uiState.value.profile?.let(::renderProfile)
        }
        binding.buttonSave.setOnClickListener { saveProfile() }
        editableFields().forEach { field ->
            field.setOnEditorActionListener { _, actionId, _ ->
                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    saveProfile()
                    true
                } else false
            }
            field.setOnFocusChangeListener { _, hasFocus ->
                if (hasFocus) keepFieldAboveKeyboard(field)
            }
        }
        binding.buttonRetry.setOnClickListener { viewModel.load() }
        observeState()
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect(::render)
            }
        }
    }

    private fun render(state: PerfilUiState) {
        binding.progress.isVisible = state.isLoading
        binding.contentProfile.isVisible = !state.isLoading && state.profile != null && !state.isEditing
        binding.editPanel.isVisible = !state.isLoading && state.profile != null && state.isEditing
        binding.layoutError.isVisible = !state.isLoading && state.hasError
        binding.progressSaving.isVisible = state.isSaving
        setEditMode(state.isEditing, state.isSaving)
        if (!state.isEditing) state.profile?.let(::renderProfile)
        state.validationError?.let(::showValidationError)
        if (state.saved) {
            hideKeyboard()
            Snackbar.make(binding.root, R.string.profile_saved, Snackbar.LENGTH_SHORT).show()
            viewModel.consumeSaved()
        }
    }

    private fun renderProfile(profile: PatientProfile) = with(binding) {
        textInitials.text = profile.initials
        textPatientName.text = profile.fullName
        textPatientFolio.text = profile.folio
        textPatientStatus.text = getString(R.string.profile_status_format, profile.status)
        displayName.text = profile.fullName.asDisplayValue()
        valueDpi.text = profile.dpi.asDisplayValue()
        displayBirthDate.text = profile.birthDate.asDisplayValue()
        displayPhone.text = profile.phone.asDisplayValue()
        displayContactEmail.text = profile.contactEmail.asDisplayValue()
        displayAddress.text = profile.address.asDisplayValue()
        displayMunicipality.text = profile.municipality.asDisplayValue()
        valueName.setText(profile.fullName)
        valueBirthDate.setText(profile.birthDate)
        valuePhone.setText(profile.phone)
        valueContactEmail.setText(profile.contactEmail)
        valueAddress.setText(profile.address)
        valueMunicipality.setText(profile.municipality)
    }

    private fun String.asDisplayValue(): String = ifBlank { getString(R.string.profile_not_registered) }

    private fun setEditMode(editing: Boolean, saving: Boolean) = with(binding) {
        layoutEditActions.isVisible = editing
        buttonCancel.isEnabled = !saving
        buttonSave.isEnabled = !saving
    }

    private fun editableFields(): List<EditText> = with(binding) {
        listOf(valueName, valueBirthDate, valuePhone, valueContactEmail, valueAddress, valueMunicipality)
    }

    private fun editLayouts(): List<TextInputLayout> = with(binding) {
        listOf(layoutName, layoutBirthDate, layoutPhone, layoutContactEmail, layoutAddress, layoutMunicipality)
    }

    private fun configureKeyboardInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { view, insets ->
            val keyboardBottom = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
            view.updatePadding(bottom = keyboardBottom)
            if (keyboardBottom > 0) {
                editableFields().firstOrNull { it.hasFocus() }?.let(::keepFieldAboveKeyboard)
            }
            insets
        }
        ViewCompat.requestApplyInsets(binding.root)
    }

    private fun keepFieldAboveKeyboard(field: EditText) {
        field.postDelayed({
            if (!field.hasFocus()) return@postDelayed
            val extraSpace = resources.getDimensionPixelSize(R.dimen.profile_keyboard_spacing)
            val fieldBounds = Rect()
            field.getDrawingRect(fieldBounds)
            binding.editPanel.offsetDescendantRectToMyCoords(field, fieldBounds)
            val visibleBottom = binding.editPanel.height - extraSpace
            val hiddenPixels = fieldBounds.bottom - visibleBottom
            if (hiddenPixels > 0) {
                binding.editPanel.smoothScrollBy(0, hiddenPixels)
            }
        }, KEYBOARD_SCROLL_DELAY_MS)
    }

    private fun beginEditing(layout: TextInputLayout, field: EditText, labelRes: Int) {
        editLayouts().forEach { it.isVisible = it === layout }
        binding.textEditTitle.text = getString(R.string.profile_edit_field, getString(labelRes))
        viewModel.startEditing()
        field.post {
            field.requestFocus()
            field.setSelection(field.text?.length ?: 0)
            WindowCompat.getInsetsController(requireActivity().window, field)
                .show(WindowInsetsCompat.Type.ime())
        }
    }

    private fun saveProfile() {
        val current = viewModel.uiState.value.profile ?: return
        clearErrors()
        viewModel.save(
            current.copy(
                fullName = binding.valueName.text.toString(),
                birthDate = binding.valueBirthDate.text.toString(),
                phone = binding.valuePhone.text.toString(),
                contactEmail = binding.valueContactEmail.text.toString(),
                address = binding.valueAddress.text.toString(),
                municipality = binding.valueMunicipality.text.toString()
            )
        )
        if (viewModel.uiState.value.validationError == null) hideKeyboard()
    }

    private fun showValidationError(error: ProfileValidationError) {
        val (layout, field, message) = when (error) {
            ProfileValidationError.NAME_REQUIRED -> Triple(binding.layoutName, binding.valueName, R.string.profile_error_name)
            ProfileValidationError.PHONE_INVALID -> Triple(binding.layoutPhone, binding.valuePhone, R.string.profile_error_phone)
            ProfileValidationError.EMAIL_INVALID -> Triple(binding.layoutContactEmail, binding.valueContactEmail, R.string.profile_error_email)
        }
        layout.error = getString(message)
        field.requestFocus()
        WindowCompat.getInsetsController(requireActivity().window, field)
            .show(WindowInsetsCompat.Type.ime())
    }

    private fun clearErrors() = with(binding) {
        layoutName.error = null
        layoutPhone.error = null
        layoutContactEmail.error = null
    }

    private fun hideKeyboard() {
        binding.root.clearFocus()
        WindowCompat.getInsetsController(requireActivity().window, binding.root)
            .hide(WindowInsetsCompat.Type.ime())
    }

    override fun onDestroyView() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.root, null)
        _binding = null
        super.onDestroyView()
    }

    private companion object {
        const val KEYBOARD_SCROLL_DELAY_MS = 220L
    }
}
