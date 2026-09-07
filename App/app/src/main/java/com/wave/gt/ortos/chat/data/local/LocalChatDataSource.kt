package com.wave.gt.ortos.chat.data.local

import com.wave.gt.ortos.chat.domain.ChatMessage
import com.wave.gt.ortos.chat.domain.MessageAuthor
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID

class LocalChatDataSource {

    private val messages = MutableStateFlow(
        listOf(
            ChatMessage(
                id = UUID.randomUUID().toString(),
                text = "Hola, soy Recepción de Clínica Dental OrtOs. ¿En qué podemos ayudarte?",
                author = MessageAuthor.CLINIC
            )
        )
    )

    fun observe(): StateFlow<List<ChatMessage>> = messages.asStateFlow()

    suspend fun send(text: String) {
        messages.update { it + message(text, MessageAuthor.PATIENT) }
        delay(1200)
        messages.update {
            it + message(
                "Gracias por tu mensaje. Un asesor te responderá en horario de atención: Lun a Vie, 8:00 - 18:00.",
                MessageAuthor.CLINIC
            )
        }
    }

    private fun message(text: String, author: MessageAuthor) = ChatMessage(
        id = UUID.randomUUID().toString(),
        text = text,
        author = author
    )
}
