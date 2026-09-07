package com.wave.gt.ortos.chat.data

import com.wave.gt.ortos.chat.data.local.LocalChatDataSource
import com.wave.gt.ortos.chat.domain.ChatMessage
import com.wave.gt.ortos.chat.domain.ChatRepository
import kotlinx.coroutines.flow.Flow

class ChatRepositoryImpl(
    private val local: LocalChatDataSource
) : ChatRepository {

    override fun observeMessages(): Flow<List<ChatMessage>> = local.observe()

    override suspend fun send(text: String) = local.send(text)
}
