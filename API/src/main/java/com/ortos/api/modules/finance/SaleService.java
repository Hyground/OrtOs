package com.ortos.api.modules.finance;

import com.ortos.api.modules.clinical.Tratamiento;
import com.ortos.api.modules.clinical.TratamientoRepository;
import com.ortos.api.modules.patients.PacienteRepository;
import com.ortos.api.modules.staff.Medico;
import com.ortos.api.modules.staff.MedicoRepository;
import com.ortos.api.shared.exception.ApiException;
import com.ortos.api.shared.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SaleService {
    private final SaleRepository sales;
    private final SaleLineRepository lines;
    private final SaleChargeRepository charges;
    private final SaleAppointmentRepository appointments;
    private final PacienteRepository patients;
    private final TratamientoRepository treatments;
    private final MedicoRepository doctors;
    private final PaymentService paymentService;
    private final PaymentAllocationRepository allocations;
    private final PaymentPlanRepository plans;
    private final InstallmentRepository installments;
    private final PaymentPlanChargeRepository planCharges;

    public SaleService(SaleRepository sales, SaleLineRepository lines, SaleChargeRepository charges,
                       SaleAppointmentRepository appointments, PacienteRepository patients,
                       TratamientoRepository treatments, MedicoRepository doctors, PaymentService paymentService,
                       PaymentAllocationRepository allocations, PaymentPlanRepository plans,
                       InstallmentRepository installments, PaymentPlanChargeRepository planCharges) {
        this.sales = sales; this.lines = lines; this.charges = charges; this.appointments = appointments;
        this.patients = patients; this.treatments = treatments; this.doctors = doctors;
        this.paymentService = paymentService; this.allocations = allocations; this.plans = plans;
        this.installments = installments; this.planCharges = planCharges;
    }

    @Transactional
    public SaleDto create(SaleRequest request, AuthenticatedUser actor) {
        if (request == null || request.getPatientId() == null || !patients.existsById(request.getPatientId()))
            throw ApiException.badRequest("Selecciona un paciente válido.");
        if (request.getLines() == null || request.getLines().isEmpty())
            throw ApiException.badRequest("Una venta requiere al menos una línea.");

        LocalDate saleDate = parseDateOrToday(request.getSaleDate(), "La fecha de venta no es válida.");
        Sale sale = new Sale();
        sale.setId(UUID.randomUUID().toString()); sale.setPatientId(request.getPatientId());
        sale.setRegisteredBy(actor != null ? actor.id() : null); sale.setSaleDate(saleDate);
        sale.setCreatedAt(LocalDateTime.now()); sales.save(sale);

        List<SaleLine> savedLines = new ArrayList<>();
        List<SaleCharge> savedCharges = new ArrayList<>();
        List<String> appointmentIds = new ArrayList<>();
        for (SaleLineRequest input : request.getLines()) {
            Tratamiento treatment = treatmentFor(input);
            SaleLine line = createLine(sale, input, treatment);
            savedLines.add(lines.save(line));
            SaleCharge charge = createCharge(sale, line, actor);
            savedCharges.add(charges.save(charge));
            appointmentIds.addAll(createAppointments(sale, line, input.getSessions(), treatment, actor));
        }

        PaymentDto downPayment = createDownPayment(request.getDownPayment(), sale, savedCharges, actor);
        PaymentPlanDto plan = createPlan(request.getPaymentPlan(), sale, savedCharges, actor);
        return saleDto(sale, savedLines, savedCharges, appointmentIds, downPayment, plan);
    }

    private Tratamiento treatmentFor(SaleLineRequest input) {
        if (input == null || input.getTreatmentId() == null || input.getTreatmentId().isBlank())
            throw ApiException.badRequest("Cada línea de venta requiere un tratamiento del catálogo.");
        Tratamiento treatment = treatments.findById(input.getTreatmentId())
                .orElseThrow(() -> ApiException.badRequest("El tratamiento no existe."));
        if (!treatment.isActive()) throw ApiException.badRequest("El tratamiento no está activo.");
        return treatment;
    }

    private SaleLine createLine(Sale sale, SaleLineRequest input, Tratamiento treatment) {
        BigDecimal quantity = input.getQuantity() == null ? BigDecimal.ONE : input.getQuantity();
        BigDecimal price = input.getUnitPrice() == null ? treatment.getPrice() : input.getUnitPrice();
        if (quantity.compareTo(BigDecimal.ZERO) <= 0 || price == null || price.compareTo(BigDecimal.ZERO) < 0)
            throw ApiException.badRequest("Cantidad y precio de venta válidos son obligatorios.");
        SaleLine line = new SaleLine();
        line.setId(UUID.randomUUID().toString()); line.setSaleId(sale.getId()); line.setTreatmentId(treatment.getId());
        line.setDescription(input.getDescription() == null || input.getDescription().isBlank() ? treatment.getName() : input.getDescription().trim());
        line.setQuantity(quantity); line.setUnitPrice(price); line.setSubtotal(money(quantity.multiply(price)));
        return line;
    }

    private SaleCharge createCharge(Sale sale, SaleLine line, AuthenticatedUser actor) {
        SaleCharge charge = new SaleCharge();
        charge.setId(UUID.randomUUID().toString()); charge.setPatientId(sale.getPatientId()); charge.setSaleId(sale.getId());
        charge.setSaleLineId(line.getId()); charge.setTreatmentId(line.getTreatmentId()); charge.setDescription(line.getDescription());
        charge.setQuantity(line.getQuantity()); charge.setUnitPrice(line.getUnitPrice()); charge.setSubtotal(line.getSubtotal());
        charge.setRegisteredBy(actor != null ? actor.id() : null); charge.setCreatedAt(LocalDateTime.now());
        return charge;
    }

    private List<String> createAppointments(Sale sale, SaleLine line, List<SaleSessionRequest> sessions,
                                            Tratamiento treatment, AuthenticatedUser actor) {
        List<String> ids = new ArrayList<>();
        if (sessions == null) return ids;
        int number = 0;
        for (SaleSessionRequest session : sessions) {
            number++;
            if (session.getDentistId() == null || session.getDentistId().isBlank())
                throw ApiException.badRequest("Cada sesión requiere un odontólogo registrado.");
            Medico doctor = doctors.findById(session.getDentistId())
                    .orElseThrow(() -> ApiException.badRequest("El odontólogo de la sesión no existe."));
            if (!"Activo".equalsIgnoreCase(doctor.getStatus()))
                throw ApiException.badRequest("El odontólogo de la sesión no está activo.");
            SaleAppointment appointment = new SaleAppointment();
            appointment.setId(UUID.randomUUID().toString()); appointment.setPatientId(sale.getPatientId());
            appointment.setSaleId(sale.getId()); appointment.setSaleLineId(line.getId()); appointment.setTreatmentId(line.getTreatmentId());
            appointment.setDentistId(doctor.getId()); appointment.setSessionNumber(number);
            appointment.setDentist((doctor.getNames() + " " + doctor.getSurnames()).trim());
            appointment.setDate(parseRequiredDate(session.getDate(), "Cada sesión requiere una fecha válida."));
            appointment.setTime(session.getTime()); appointment.setDuration(session.getDuration() == null ? String.valueOf(treatment.getDurationMin()) : session.getDuration());
            appointment.setChair(session.getChair()); appointment.setTreatment(line.getDescription()); appointment.setType("Tratamiento programado");
            appointment.setPriority("Media"); appointment.setNotes(session.getNotes()); appointment.setReason(line.getDescription());
            appointment.setCreatedBy(actor != null ? actor.id() : null); appointment.setCreatedAt(LocalDateTime.now());
            appointments.save(appointment); ids.add(appointment.getId());
        }
        return ids;
    }

    private PaymentDto createDownPayment(SalePaymentRequest input, Sale sale, List<SaleCharge> saleCharges,
                                         AuthenticatedUser actor) {
        if (input == null || input.getAmount() == null || input.getAmount().compareTo(BigDecimal.ZERO) == 0) return null;
        if (input.getAmount().compareTo(BigDecimal.ZERO) < 0) throw ApiException.badRequest("El anticipo no puede ser negativo.");
        BigDecimal total = saleCharges.stream().map(SaleCharge::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (input.getAmount().compareTo(total) > 0) throw ApiException.badRequest("El anticipo no puede superar el total de la venta.");
        PaymentDto payment = new PaymentDto(); payment.setPatientId(sale.getPatientId()); payment.setAmount(money(input.getAmount()));
        payment.setCurrency(input.getCurrency()); payment.setMethod(input.getMethod()); payment.setReference(input.getReference());
        payment.setNotes(input.getNotes()); payment.setReceipt(input.isReceipt()); payment.setDate(input.getDate());
        payment.setAllocations(saleCharges.stream().map(c -> new PaymentAllocationInput(c.getId(), null)).toList());
        return paymentService.create(payment, actor);
    }

    private PaymentPlanDto createPlan(SalePlanRequest input, Sale sale, List<SaleCharge> saleCharges, AuthenticatedUser actor) {
        if (input == null) return null;
        if (input.getInstallmentCount() == null || input.getInstallmentCount() < 1)
            throw ApiException.badRequest("El plan requiere un número de cuotas válido.");
        BigDecimal available = saleCharges.stream().map(this::balance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal financed = input.getFinancedAmount() == null ? available : input.getFinancedAmount();
        if (financed.compareTo(BigDecimal.ZERO) <= 0 || financed.compareTo(available) > 0)
            throw ApiException.badRequest("El plan solo puede financiar el saldo pendiente de la venta.");
        PaymentPlan plan = new PaymentPlan(); plan.setId(UUID.randomUUID().toString()); plan.setPatientId(sale.getPatientId());
        plan.setTotalAmount(saleCharges.stream().map(SaleCharge::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add));
        plan.setFinancedAmount(money(financed)); plan.setInstallmentCount(input.getInstallmentCount()); plan.setName(input.getName() == null || input.getName().isBlank() ? "Plan de pago" : input.getName().trim()); plan.setRegisteredBy(actor != null ? actor.id() : null); plan.setCreatedAt(LocalDateTime.now());
        plans.save(plan);
        BigDecimal pending = financed;
        for (SaleCharge charge : saleCharges) {
            BigDecimal linked = balance(charge).min(pending);
            if (linked.signum() <= 0) continue;
            PaymentPlanCharge relation = new PaymentPlanCharge(); relation.setPaymentPlanId(plan.getId()); relation.setChargeId(charge.getId()); relation.setFinancedAmount(linked); planCharges.save(relation);
            pending = pending.subtract(linked); if (pending.signum() == 0) break;
        }
        LocalDate firstDue = parseDateOrDefault(input.getFirstDueDate(), LocalDate.now().plusMonths(1));
        BigDecimal base = financed.divide(BigDecimal.valueOf(input.getInstallmentCount()), 2, RoundingMode.DOWN);
        BigDecimal remainder = financed.subtract(base.multiply(BigDecimal.valueOf(input.getInstallmentCount())));
        for (int i = 1; i <= input.getInstallmentCount(); i++) {
            Installment installment = new Installment(); installment.setId(UUID.randomUUID().toString()); installment.setPaymentPlanId(plan.getId());
            installment.setNumber(i); installment.setAmount(i == input.getInstallmentCount() ? base.add(remainder) : base);
            installment.setDueDate(firstDue.plusMonths(i - 1)); installments.save(installment);
        }
        return planDto(plan);
    }

    private BigDecimal balance(SaleCharge charge) { return charge.getSubtotal().subtract(allocations.totalForCharge(charge.getId())); }

    private SaleDto saleDto(Sale sale, List<SaleLine> savedLines, List<SaleCharge> savedCharges, List<String> appointmentIds, PaymentDto payment, PaymentPlanDto plan) {
        SaleDto dto = new SaleDto(); dto.setId(sale.getId()); dto.setPatientId(sale.getPatientId()); dto.setSaleDate(sale.getSaleDate().toString()); dto.setStatus(sale.getStatus());
        dto.setLines(savedLines.stream().map(this::lineDto).toList()); dto.setCharges(savedCharges.stream().map(this::chargeDto).toList()); dto.setAppointmentIds(appointmentIds); dto.setDownPayment(payment); dto.setPaymentPlan(plan);
        dto.setTotal(savedCharges.stream().map(SaleCharge::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add)); return dto;
    }
    private SaleLineDto lineDto(SaleLine line) { SaleLineDto dto = new SaleLineDto(); dto.setId(line.getId()); dto.setTreatmentId(line.getTreatmentId()); dto.setDescription(line.getDescription()); dto.setQuantity(line.getQuantity()); dto.setUnitPrice(line.getUnitPrice()); dto.setSubtotal(line.getSubtotal()); return dto; }
    private ChargeDto chargeDto(SaleCharge charge) { ChargeDto dto = new ChargeDto(); dto.setId(charge.getId()); dto.setPatientId(charge.getPatientId()); dto.setTreatmentId(charge.getTreatmentId()); dto.setDescription(charge.getDescription()); dto.setQuantity(charge.getQuantity()); dto.setUnitPrice(charge.getUnitPrice()); dto.setSubtotal(charge.getSubtotal()); BigDecimal paid = allocations.totalForCharge(charge.getId()); dto.setPaid(paid); dto.setBalance(charge.getSubtotal().subtract(paid)); dto.setStatus(paid.signum() == 0 ? "Pendiente" : dto.getBalance().signum() == 0 ? "Pagado" : "Parcial"); return dto; }
    private PaymentPlanDto planDto(PaymentPlan plan) { PaymentPlanDto dto = new PaymentPlanDto(); dto.setId(plan.getId()); dto.setPatientId(plan.getPatientId()); dto.setName(plan.getName()); dto.setTotalAmount(plan.getTotalAmount()); dto.setFinancedAmount(plan.getFinancedAmount()); dto.setInstallmentCount(plan.getInstallmentCount()); dto.setStatus(plan.getStatus()); List<InstallmentDto> items = installments.findByPaymentPlanIdOrderByNumber(plan.getId()).stream().map(i -> { InstallmentDto d = new InstallmentDto(); d.setId(i.getId()); d.setNumber(i.getNumber()); d.setAmount(i.getAmount()); d.setPaidAmount(BigDecimal.ZERO); d.setDueDate(i.getDueDate().toString()); d.setStatus(i.getDueDate().isBefore(LocalDate.now()) ? "Vencida" : "Pendiente"); return d; }).toList(); dto.setInstallments(items); dto.setPaidAmount(BigDecimal.ZERO); dto.setBalance(plan.getFinancedAmount()); return dto; }
    private BigDecimal money(BigDecimal value) { return value.setScale(2, RoundingMode.HALF_UP); }
    private LocalDate parseDateOrToday(String value, String message) { return value == null || value.isBlank() ? LocalDate.now() : parseRequiredDate(value, message); }
    private LocalDate parseDateOrDefault(String value, LocalDate fallback) { return value == null || value.isBlank() ? fallback : parseRequiredDate(value, "La fecha de vencimiento no es válida."); }
    private LocalDate parseRequiredDate(String value, String message) { try { return LocalDate.parse(value); } catch (Exception e) { throw ApiException.badRequest(message); } }
}
