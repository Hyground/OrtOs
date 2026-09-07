package com.wave.gt.ortos.home.domain

data class HomeDashboard(
    val patientName: String,
    val treatment: TreatmentProgress?,
    val promotions: List<Promotion>,
    val nextAppointment: Appointment?,
    val payments: PaymentSummary
)

data class TreatmentProgress(
    val treatmentName: String,
    val currentStep: Int,
    val totalSteps: Int,
    val nextChangeLabel: String
) {
    val completionPercent: Int
        get() = if (totalSteps <= 0) 0 else (currentStep * 100) / totalSteps

    val nextStep: Int
        get() = (currentStep + 1).coerceAtMost(totalSteps)
}

data class Promotion(
    val id: String,
    val title: String,
    val description: String,
    val badge: String?,
    val ctaLabel: String?
)

data class Appointment(
    val id: String,
    val monthLabel: String,
    val dayLabel: String,
    val timeLabel: String,
    val title: String,
    val dentistName: String,
    val locationLabel: String
)

data class PaymentSummary(
    val label: String,
    val pendingBalance: Double,
    val dueDateLabel: String?
)
