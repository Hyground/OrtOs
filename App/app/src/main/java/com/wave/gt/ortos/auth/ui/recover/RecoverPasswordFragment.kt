package com.wave.gt.ortos.auth.ui.recover

import android.os.Bundle
import android.view.View
import androidx.core.view.isVisible
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.google.android.material.snackbar.Snackbar
import com.wave.gt.ortos.R
import com.wave.gt.ortos.auth.ui.AuthViewModelFactory
import com.wave.gt.ortos.auth.ui.toEmailMessage
import com.wave.gt.ortos.auth.ui.toMessage
import com.wave.gt.ortos.databinding.FragmentRecoverPasswordBinding
import com.wave.gt.ortos.di.appContainer
import kotlinx.coroutines.launch

class RecoverPasswordFragment : Fragment(R.layout.fragment_recover_password) {

    private var _binding: FragmentRecoverPasswordBinding? = null
    private val binding get() = _binding!!

    private val viewModel: RecoverPasswordViewModel by viewModels {
        AuthViewModelFactory {
            RecoverPasswordViewModel(appContainer.recoverPasswordUseCase)
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentRecoverPasswordBinding.bind(view)

        binding.inputEmail.doAfterTextChanged { text ->
            viewModel.onEmailChange(text?.toString().orEmpty())
        }
        binding.buttonSend.setOnClickListener { viewModel.submit() }
        binding.buttonBack.setOnClickListener { findNavController().popBackStack() }

        observeState()
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect(::render)
            }
        }
    }

    private fun render(state: RecoverPasswordUiState) {
        binding.layoutEmail.error = state.emailError?.let { getString(it.toEmailMessage()) }
        binding.progress.isVisible = state.isLoading
        binding.buttonSend.isEnabled = !state.isLoading && !state.emailSent

        binding.groupForm.isVisible = !state.emailSent
        binding.groupSuccess.isVisible = state.emailSent

        state.errorType?.let { error ->
            Snackbar.make(binding.root, getString(error.toMessage()), Snackbar.LENGTH_LONG).show()
            viewModel.errorShown()
        }
    }

    override fun onDestroyView() {
        _binding = null
        super.onDestroyView()
    }
}
