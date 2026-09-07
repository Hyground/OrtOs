package com.wave.gt.ortos.chat.domain

import kotlinx.coroutines.flow.Flow

interface ChatRepository {

    fun observeMessages(): Flow<List<ChatMessage>>

    suspend fun send(text: String)
}
