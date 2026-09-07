package com.wave.gt.ortos.home.ui

import com.wave.gt.ortos.home.domain.Promotion

interface HomeActions {
    fun onOpenTreatment()
    fun onOpenAppointments()
    fun onOpenPayments()
    fun onPromotionClick(promotion: Promotion)
}
