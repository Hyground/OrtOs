package com.wave.gt.ortos.chat.ui

import com.wave.gt.ortos.chat.domain.ChatMessage

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isSending: Boolean = false
)
