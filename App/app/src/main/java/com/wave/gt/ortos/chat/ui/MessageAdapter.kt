package com.wave.gt.ortos.chat.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.wave.gt.ortos.chat.domain.ChatMessage
import com.wave.gt.ortos.chat.domain.MessageAuthor
import com.wave.gt.ortos.core.diffCallback
import com.wave.gt.ortos.databinding.ItemChatMessageClinicBinding
import com.wave.gt.ortos.databinding.ItemChatMessagePatientBinding

class MessageAdapter : ListAdapter<ChatMessage, RecyclerView.ViewHolder>(
    diffCallback { old, new -> old.id == new.id }
) {

    override fun getItemViewType(position: Int): Int = when (getItem(position).author) {
        MessageAuthor.PATIENT -> TYPE_PATIENT
        MessageAuthor.CLINIC -> TYPE_CLINIC
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return if (viewType == TYPE_PATIENT) {
            PatientViewHolder(ItemChatMessagePatientBinding.inflate(inflater, parent, false))
        } else {
            ClinicViewHolder(ItemChatMessageClinicBinding.inflate(inflater, parent, false))
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val message = getItem(position)
        when (holder) {
            is PatientViewHolder -> holder.bind(message)
            is ClinicViewHolder -> holder.bind(message)
        }
    }

    class PatientViewHolder(
        private val binding: ItemChatMessagePatientBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        fun bind(message: ChatMessage) {
            binding.textMessage.text = message.text
        }
    }

    class ClinicViewHolder(
        private val binding: ItemChatMessageClinicBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        fun bind(message: ChatMessage) {
            binding.textMessage.text = message.text
        }
    }

    private companion object {
        const val TYPE_PATIENT = 0
        const val TYPE_CLINIC = 1
    }
}
