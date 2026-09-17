package com.wave.gt.ortos.pagos.domain

import java.time.LocalDate

data class PaymentDashboard(
    val patientName: String,
    val treatmentName: String,
    val payments: List<PatientPayment>
) {
    val pendingPayments: List<PatientPayment>
        get() = payments.filter { it.status == PaymentStatus.Pending || it.status == PaymentStatus.Overdue }

    val historyPayments: List<PatientPayment>
        get() = payments.filter { it.status == PaymentStatus.Paid || it.status == PaymentStatus.InReview }

    val pendingTotal: Double
        get() = pendingPayments.sumOf { it.amount }

    val paidTotal: Double
        get() = payments.filter { it.status == PaymentStatus.Paid }.sumOf { it.amount }

    val nextPending: PatientPayment?
        get() = pendingPayments.minByOrNull { it.dueDate }
}

data class PatientPayment(
    val id: String,
    val concept: String,
    val amount: Double,
    val dueDate: LocalDate,
    val paidDate: LocalDate?,
    val methodLabel: String?,
    val status: PaymentStatus
)

enum class PaymentStatus {
    Pending,
    Overdue,
    InReview,
    Paid
}