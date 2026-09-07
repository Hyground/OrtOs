package com.wave.gt.ortos.core

import androidx.recyclerview.widget.DiffUtil

@Suppress("DiffUtilEquals")
fun <T : Any> diffCallback(
    sameItem: (old: T, new: T) -> Boolean
): DiffUtil.ItemCallback<T> = object : DiffUtil.ItemCallback<T>() {
    override fun areItemsTheSame(oldItem: T, newItem: T) = sameItem(oldItem, newItem)
    override fun areContentsTheSame(oldItem: T, newItem: T) = oldItem == newItem
}
