package com.wave.gt.ortos.auth.ui.login

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
import com.wave.gt.ortos.auth.ui.AuthActivity
import com.wave.gt.ortos.auth.ui.AuthViewModelFactory
import com.wave.gt.ortos.auth.ui.toMessage
import com.wave.gt.ortos.auth.ui.toEmailMessage
import com.wave.gt.ortos.auth.ui.toPasswordMessage
import com.wave.gt.ortos.databinding.FragmentLoginBinding
import com.wave.gt.ortos.di.appContainer
import kotlinx.coroutines.launch

class LoginFragment : Fragment(R.layout.fragment_login) {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val viewModel: LoginViewModel by viewModels {
        AuthViewModelFactory {
            LoginViewModel(
                appContainer.loginWithEmailUseCase,
                appContainer.loginWithGoogleUseCase
            )
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentLoginBinding.bind(view)
        setupListeners()
        observeState()
    }

    private fun setupListeners() {
        binding.inputEmail.doAfterTextChanged { text ->
            viewModel.onEmailChange(text?.toString().orEmpty())
        }
        binding.inputPassword.doAfterTextChanged { text ->
            viewModel.onPasswordChange(text?.toString().orEmpty())
        }
        binding.buttonLogin.setOnClickListener { viewModel.submit() }
        binding.buttonForgotPassword.setOnClickListener {
            findNavController().navigate(R.id.action_login_to_recover)
        }
        binding.buttonGoogle.setOnClickListener { viewModel.signInWithGoogle(idToken = null) }
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect(::render)
            }
        }
    }

    private fun render(state: LoginUiState) {
        binding.layoutEmail.error = state.emailError?.let { getString(it.toEmailMessage()) }
        binding.layoutPassword.error = state.passwordError?.let { getString(it.toPasswordMessage()) }

        binding.loadingOverlay.isVisible = state.isLoading
        binding.buttonLogin.isEnabled = !state.isLoading
        binding.buttonGoogle.isEnabled = !state.isLoading
        binding.buttonForgotPassword.isEnabled = !state.isLoading

        state.errorType?.let { error ->
            Snackbar.make(binding.root, getString(error.toMessage()), Snackbar.LENGTH_LONG).show()
            viewModel.errorShown()
        }

        if (state.authenticated) {
            (requireActivity() as AuthActivity).onAuthenticated()
        }
    }

    override fun onDestroyView() {
        _binding = null
        super.onDestroyView()
    }
}
