package com.wave.gt.ortos.pagos.data.local

import com.wave.gt.ortos.pagos.domain.PatientPayment
import com.wave.gt.ortos.pagos.domain.PaymentDashboard
import com.wave.gt.ortos.pagos.domain.PaymentStatus
import kotlinx.coroutines.delay
import java.time.LocalDate

class LocalPagosDataSource {

    suspend fun getPaymentDashboard(): PaymentDashboard {
        delay(400)
        return PaymentDashboard(
            patientName = "Maria",
            treatmentName = "Ortodoncia invisible",
            payments = listOf(
                PatientPayment(
                    id = "pay-2026-09",
                    concept = "Cuota de tratamiento septiembre",
                    amount = 350.0,
                    dueDate = LocalDate.of(2026, 9, 20),
                    paidDate = null,
                    methodLabel = null,
                    status = PaymentStatus.Pending
                ),
                PatientPayment(
                    id = "pay-retainer",
                    concept = "Retenedor superior",
                    amount = 225.0,
                    dueDate = LocalDate.of(2026, 9, 8),
                    paidDate = null,
                    methodLabel = null,
                    status = PaymentStatus.Overdue
                ),
                PatientPayment(
                    id = "pay-2026-08",
                    concept = "Cuota de tratamiento agosto",
                    amount = 350.0,
                    dueDate = LocalDate.of(2026, 8, 20),
                    paidDate = LocalDate.of(2026, 8, 18),
                    methodLabel = "Tarjeta",
                    status = PaymentStatus.Paid
                ),
                PatientPayment(
                    id = "pay-2026-07",
                    concept = "Cuota de tratamiento julio",
                    amount = 350.0,
                    dueDate = LocalDate.of(2026, 7, 20),
                    paidDate = LocalDate.of(2026, 7, 19),
                    methodLabel = "Transferencia",
                    status = PaymentStatus.Paid
                ),
                PatientPayment(
                    id = "pay-initial",
                    concept = "Cuota inicial",
                    amount = 900.0,
                    dueDate = LocalDate.of(2026, 6, 12),
                    paidDate = LocalDate.of(2026, 6, 12),
                    methodLabel = "Efectivo",
                    status = PaymentStatus.Paid
                )
            )
        )
    }
}
