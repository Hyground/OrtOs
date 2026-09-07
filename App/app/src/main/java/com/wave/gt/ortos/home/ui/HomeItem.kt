package com.wave.gt.ortos.home.ui

import com.wave.gt.ortos.home.domain.Appointment
import com.wave.gt.ortos.home.domain.HomeDashboard
import com.wave.gt.ortos.home.domain.PaymentSummary
import com.wave.gt.ortos.home.domain.Promotion
import com.wave.gt.ortos.home.domain.TreatmentProgress

sealed interface HomeItem {

    val id: String

    data class Header(val patientName: String) : HomeItem {
        override val id = "header"
    }

    data class Treatment(val progress: TreatmentProgress) : HomeItem {
        override val id = "treatment"
    }

    data class Promotions(val promotions: List<Promotion>) : HomeItem {
        override val id = "promotions"
    }

    data class NextAppointment(val appointment: Appointment) : HomeItem {
        override val id = "next-appointment"
    }

    data class Payments(val summary: PaymentSummary) : HomeItem {
        override val id = "payments"
    }
}

fun HomeDashboard.toHomeItems(): List<HomeItem> = buildList {
    add(HomeItem.Header(patientName))
    treatment?.let { add(HomeItem.Treatment(it)) }
    if (promotions.isNotEmpty()) add(HomeItem.Promotions(promotions))
    nextAppointment?.let { add(HomeItem.NextAppointment(it)) }
    add(HomeItem.Payments(payments))
}
