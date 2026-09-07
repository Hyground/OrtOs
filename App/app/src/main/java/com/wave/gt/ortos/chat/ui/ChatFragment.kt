package com.wave.gt.ortos.chat.ui

import android.os.Bundle
import android.view.View
import androidx.core.view.isVisible
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.wave.gt.ortos.R
import com.wave.gt.ortos.databinding.FragmentChatBinding
import com.wave.gt.ortos.di.ViewModelFactory
import com.wave.gt.ortos.di.appContainer
import kotlinx.coroutines.launch

class ChatFragment : Fragment(R.layout.fragment_chat) {

    private var _binding: FragmentChatBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ChatViewModel by viewModels {
        ViewModelFactory {
            ChatViewModel(appContainer.observeMessagesUseCase, appContainer.sendMessageUseCase)
        }
    }

    private val messageAdapter = MessageAdapter()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentChatBinding.bind(view)

        binding.recyclerMessages.layoutManager = LinearLayoutManager(requireContext()).apply {
            stackFromEnd = true
        }
        binding.recyclerMessages.adapter = messageAdapter

        binding.inputMessage.doAfterTextChanged { text ->
            binding.buttonSend.isEnabled = !text.isNullOrBlank()
        }
        binding.buttonSend.setOnClickListener { sendCurrentMessage() }

        observeState()
    }

    private fun sendCurrentMessage() {
        val text = binding.inputMessage.text?.toString().orEmpty()
        if (text.isBlank()) return
        viewModel.send(text)
        binding.inputMessage.text?.clear()
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    binding.progressSending.isVisible = state.isSending
                    messageAdapter.submitList(state.messages) {
                        if (state.messages.isNotEmpty()) {
                            binding.recyclerMessages.scrollToPosition(state.messages.lastIndex)
                        }
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        binding.recyclerMessages.adapter = null
        _binding = null
        super.onDestroyView()
    }
}
