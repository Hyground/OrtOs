package com.wave.gt.ortos.home.data.local

import com.wave.gt.ortos.home.domain.Appointment
import com.wave.gt.ortos.home.domain.HomeDashboard
import com.wave.gt.ortos.home.domain.PaymentSummary
import com.wave.gt.ortos.home.domain.Promotion
import com.wave.gt.ortos.home.domain.TreatmentProgress
import kotlinx.coroutines.delay

class LocalHomeDataSource {

    suspend fun getDashboard(): HomeDashboard {
        delay(500)
        return HomeDashboard(
            patientName = "María",
            treatment = TreatmentProgress(
                treatmentName = "Ortodoncia invisible",
                currentStep = 14,
                totalSteps = 24,
                nextChangeLabel = "En 3 días"
            ),
            promotions = listOf(
                Promotion(
                    id = "promo-1",
                    title = "Limpieza ultrasónica",
                    description = "Elimina placa antes de tu siguiente alineador.",
                    badge = "-30%",
                    ctaLabel = "Agendar"
                ),
                Promotion(
                    id = "promo-2",
                    title = "Refiere a un amigo",
                    description = "Reciben Q200 de crédito cada uno.",
                    badge = "Gana Q200",
                    ctaLabel = "Compartir"
                ),
                Promotion(
                    id = "promo-3",
                    title = "Control de retenedores",
                    description = "Revisión y ajuste para mantener tu resultado.",
                    badge = null,
                    ctaLabel = "Agendar"
                )
            ),
            nextAppointment = Appointment(
                id = "apt-1",
                monthLabel = "SEP",
                dayLabel = "12",
                timeLabel = "10:00 a. m.",
                title = "Control y entrega de alineadores",
                dentistName = "Dra. Ana López",
                locationLabel = "Consultorio 3"
            ),
            payments = PaymentSummary(
                label = "Mensualidad pendiente",
                pendingBalance = 350.0,
                dueDateLabel = "20 sep"
            )
        )
    }
}
