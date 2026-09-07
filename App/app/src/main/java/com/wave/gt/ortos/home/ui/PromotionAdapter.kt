package com.wave.gt.ortos.home.ui

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.annotation.ColorRes
import androidx.core.content.ContextCompat
import androidx.core.view.isVisible
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.wave.gt.ortos.R
import com.wave.gt.ortos.core.diffCallback
import com.wave.gt.ortos.databinding.ItemPromotionBinding
import com.wave.gt.ortos.home.domain.Promotion

class PromotionAdapter(
    private val onClick: (Promotion) -> Unit
) : ListAdapter<Promotion, PromotionAdapter.PromotionViewHolder>(diffCallback { old, new -> old.id == new.id }) {

    private data class Palette(
        @ColorRes val cardBackground: Int,
        @ColorRes val onColor: Int,
        val solid: Boolean
    )

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PromotionViewHolder {
        val binding = ItemPromotionBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return PromotionViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PromotionViewHolder, position: Int) {
        holder.bind(getItem(position), position)
    }

    inner class PromotionViewHolder(
        private val binding: ItemPromotionBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(promotion: Promotion, position: Int) {
            val context = binding.root.context
            val palette = PALETTES[position % PALETTES.size]

            val cardBg = ContextCompat.getColor(context, palette.cardBackground)
            val onColor = ContextCompat.getColor(context, palette.onColor)
            val primary = ContextCompat.getColor(context, R.color.brand_primary)
            val white = ContextCompat.getColor(context, R.color.white)

            binding.cardPromotion.setCardBackgroundColor(cardBg)

            binding.textBadge.isVisible = !promotion.badge.isNullOrBlank()
            binding.textBadge.text = promotion.badge
            if (palette.solid) {
                binding.textBadge.setTextColor(cardBg)
                binding.textBadge.backgroundTintList = ColorStateList.valueOf(white)
            } else {
                binding.textBadge.setTextColor(white)
                binding.textBadge.backgroundTintList = ColorStateList.valueOf(primary)
            }

            binding.textTitle.text = promotion.title
            binding.textTitle.setTextColor(onColor)
            binding.textDescription.text = promotion.description
            binding.textDescription.setTextColor(onColor)

            binding.buttonCta.isVisible = !promotion.ctaLabel.isNullOrBlank()
            binding.buttonCta.text = promotion.ctaLabel
            if (palette.solid) {
                binding.buttonCta.backgroundTintList = ColorStateList.valueOf(white)
                binding.buttonCta.setTextColor(cardBg)
            } else {
                binding.buttonCta.backgroundTintList = ColorStateList.valueOf(primary)
                binding.buttonCta.setTextColor(white)
            }

            binding.root.setOnClickListener { onClick(promotion) }
            binding.buttonCta.setOnClickListener { onClick(promotion) }
        }
    }

    private companion object {
        val PALETTES = listOf(
            Palette(R.color.promo_a_bg, R.color.promo_a_on, solid = false),
            Palette(R.color.promo_b_bg, R.color.promo_b_on, solid = true),
            Palette(R.color.promo_c_bg, R.color.promo_c_on, solid = false)
        )
    }
}
