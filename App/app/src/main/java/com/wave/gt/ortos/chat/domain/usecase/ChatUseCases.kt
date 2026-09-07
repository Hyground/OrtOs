package com.wave.gt.ortos.chat.domain.usecase

import com.wave.gt.ortos.chat.domain.ChatMessage
import com.wave.gt.ortos.chat.domain.ChatRepository
import kotlinx.coroutines.flow.Flow

class ObserveMessagesUseCase(
    private val repository: ChatRepository
) {
    operator fun invoke(): Flow<List<ChatMessage>> = repository.observeMessages()
}

class SendMessageUseCase(
    private val repository: ChatRepository
) {
    suspend operator fun invoke(text: String) {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return
        repository.send(trimmed)
    }
}
