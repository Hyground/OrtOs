package com.wave.gt.ortos.chat.domain

enum class MessageAuthor {
    PATIENT,
    CLINIC
}

data class ChatMessage(
    val id: String,
    val text: String,
    val author: MessageAuthor
)
