package com.ortos.api.modules.finance;

import com.ortos.api.modules.patients.PacienteRepository;
import com.ortos.api.shared.exception.ApiException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/** Read projection for the unified financial source of truth: charges and payment allocations. */
@Service
public class FinancialAccountService {
    private final ChargeRepository charges;
    private final PaymentAllocationRepository allocations;
    private final PagoRepository payments;
    private final PaymentPlanRepository plans;
    private final InstallmentRepository installments;
    private final PaymentPlanChargeRepository planCharges;
    private final PacienteRepository patients;

    public FinancialAccountService(ChargeRepository charges, PaymentAllocationRepository allocations, PagoRepository payments,
                                   PaymentPlanRepository plans, InstallmentRepository installments,
                                   PaymentPlanChargeRepository planCharges, PacienteRepository patients) {
        this.charges = charges; this.allocations = allocations; this.payments = payments; this.plans = plans;
        this.installments = installments; this.planCharges = planCharges; this.patients = patients;
    }

    public PatientAccountDto account(String patientId) {
        if (!patients.existsById(patientId)) throw ApiException.notFound("El paciente no existe.");
        List<ChargeDto> chargeDtos = charges.findByPatientIdOrderByCreatedAtDesc(patientId).stream().map(this::charge).toList();
        PatientAccountDto account = new PatientAccountDto(); account.setPatientId(patientId); account.setCharges(chargeDtos);
        account.setTotalCharged(chargeDtos.stream().filter(c -> !"Anulado".equals(c.getStatus())).map(ChargeDto::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add));
        account.setTotalPaid(chargeDtos.stream().map(ChargeDto::getPaid).reduce(BigDecimal.ZERO, BigDecimal::add));
        account.setBalance(account.getTotalCharged().subtract(account.getTotalPaid()).max(BigDecimal.ZERO));
        account.setPayments(payments.findByPatientIdAndStatusNot(patientId, "Anulado").stream().map(this::payment).toList());
        List<PaymentPlanDto> planDtos = plans.findByPatientIdOrderByCreatedAtDesc(patientId).stream().map(this::plan).toList(); account.setPlans(planDtos);
        account.setNextPayment(planDtos.stream().flatMap(p -> p.getInstallments().stream()).filter(i -> !"Pagada".equals(i.getStatus())).map(InstallmentDto::getDueDate).filter(d -> d != null).min(String::compareTo).orElse(null));
        return account;
    }

    private ChargeDto charge(Cargo charge) {
        BigDecimal paid = allocations.totalForCharge(charge.getId()); BigDecimal balance = charge.getSubtotal().subtract(paid).max(BigDecimal.ZERO);
        ChargeDto dto = new ChargeDto(); dto.setId(charge.getId()); dto.setPatientId(charge.getPatientId()); dto.setAppointmentId(charge.getAppointmentId()); dto.setTreatmentId(charge.getTreatmentId()); dto.setDescription(charge.getDescription()); dto.setQuantity(charge.getQuantity()); dto.setUnitPrice(charge.getUnitPrice()); dto.setSubtotal(charge.getSubtotal()); dto.setPaid(paid); dto.setBalance(balance); dto.setCreatedAt(charge.getCreatedAt().toString()); dto.setStatus("Anulado".equals(charge.getStatus()) ? "Anulado" : balance.signum() == 0 ? "Pagado" : paid.signum() > 0 ? "Parcial" : "Pendiente"); return dto;
    }

    private PaymentDto payment(Pago payment) {
        PaymentDto dto = new PaymentDto(); dto.setId(payment.getId()); dto.setPatientId(payment.getPatientId()); dto.setAmount(payment.getAmount()); dto.setCurrency(payment.getCurrency()); dto.setMethod(payment.getMethod()); dto.setDate(payment.getDate().toString()); dto.setReference(payment.getReference()); dto.setNotes(payment.getNotes()); dto.setReceipt(payment.isReceipt()); dto.setReceiptNumber(payment.getReceiptNumber()); dto.setStatus(payment.getStatus()); dto.setRegistradoPor(payment.getRegistradoPor()); return dto;
    }

    private PaymentPlanDto plan(PaymentPlan plan) {
        BigDecimal paid = planCharges.findByPaymentPlanId(plan.getId()).stream().map(link -> {
            Cargo charge = charges.findById(link.getChargeId()).orElseThrow(() -> ApiException.notFound("El cargo financiado no existe."));
            BigDecimal prePlanPaid = charge.getSubtotal().subtract(link.getFinancedAmount());
            return allocations.totalForCharge(charge.getId()).subtract(prePlanPaid).max(BigDecimal.ZERO).min(link.getFinancedAmount());
        }).reduce(BigDecimal.ZERO, BigDecimal::add).min(plan.getFinancedAmount());
        BigDecimal[] remainingPaid = {paid};
        List<InstallmentDto> quotaDtos = installments.findByPaymentPlanIdOrderByNumber(plan.getId()).stream().map(quota -> {
            InstallmentDto dto = new InstallmentDto(); dto.setId(quota.getId()); dto.setNumber(quota.getNumber()); dto.setAmount(quota.getAmount()); dto.setDueDate(quota.getDueDate().toString());
            BigDecimal applied = remainingPaid[0].min(quota.getAmount()); remainingPaid[0] = remainingPaid[0].subtract(applied); dto.setPaidAmount(applied); dto.setStatus(applied.compareTo(quota.getAmount()) >= 0 ? "Pagada" : quota.getDueDate().isBefore(LocalDate.now()) ? "Vencida" : "Pendiente"); return dto;
        }).toList();
        PaymentPlanDto dto = new PaymentPlanDto(); dto.setId(plan.getId()); dto.setPatientId(plan.getPatientId()); dto.setName(plan.getName()); dto.setTotalAmount(plan.getTotalAmount()); dto.setFinancedAmount(plan.getFinancedAmount()); dto.setInstallmentCount(plan.getInstallmentCount()); dto.setStatus(plan.getStatus()); dto.setPaidAmount(paid); dto.setBalance(plan.getFinancedAmount().subtract(paid)); dto.setInstallments(quotaDtos); return dto;
    }
}
