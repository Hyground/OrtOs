package com.ortos.api.modules.finance;

import com.ortos.api.modules.finance.PaymentDto;
import com.ortos.api.modules.finance.Pago;
import com.ortos.api.shared.exception.ApiException;
import com.ortos.api.modules.patients.PacienteRepository;
import com.ortos.api.modules.finance.PagoRepository;
import com.ortos.api.shared.security.AuthenticatedUser;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import java.util.ArrayList;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final PagoRepository pagoRepository;
    private final PacienteRepository pacienteRepository;
    private final ChargeRepository chargeRepository;
    private final PaymentAllocationRepository allocationRepository;
    private static final DateTimeFormatter TS = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public PaymentService(PagoRepository pagoRepository, PacienteRepository pacienteRepository,
                          ChargeRepository chargeRepository, PaymentAllocationRepository allocationRepository) {
        this.pagoRepository = pagoRepository;
        this.pacienteRepository = pacienteRepository;
        this.chargeRepository = chargeRepository;
        this.allocationRepository = allocationRepository;
    }

    public List<PaymentDto> findAll() {
        return pagoRepository.findAll().stream().map(this::toDto).toList();
    }

    public PaymentDto findById(String id) {
        return toDto(getEntity(id));
    }

    public Pago getEntity(String id) {
        return pagoRepository.findById(id).orElseThrow(() -> ApiException.notFound("El pago no existe."));
    }

    @Transactional
    public PaymentDto create(PaymentDto dto, AuthenticatedUser actor) {
        validate(dto);
        Pago entity = new Pago();
        entity.setId(UUID.randomUUID().toString());
        applyInput(entity, dto);
        entity.setReceiptNumber(dto.isReceipt() ? nextReceiptNumber() : null);
        entity.setRegistradoPor(actor != null ? actor.id() : null);
        entity.setFechaCreacion(LocalDateTime.now());
        pagoRepository.save(entity);
        allocate(entity, dto.getAllocations());
        return toDto(entity);
    }

    @Transactional
    public PaymentDto cancel(String id) {
        Pago entity = getEntity(id);
        if ("Anulado".equals(entity.getStatus())) return toDto(entity);
        entity.setStatus("Anulado");
        pagoRepository.save(entity);
        return toDto(entity);
    }

    /** Preserves the public edit endpoint without allowing a settled amount to drift. */
    @Transactional
    public PaymentDto update(String id, PaymentDto dto) {
        Pago entity = getEntity(id);
        if (dto.getAmount() != null && dto.getAmount().compareTo(entity.getAmount()) != 0)
            throw ApiException.badRequest("No se puede cambiar el monto de un pago registrado; anúlalo y registra uno nuevo.");
        entity.setConcept(dto.getConcept()); entity.setTreatment(dto.getTreatment()); entity.setMethod(dto.getMethod());
        entity.setReference(dto.getReference()); entity.setNotes(dto.getNotes()); entity.setReceipt(dto.isReceipt());
        if (dto.isReceipt() && entity.getReceiptNumber() == null) entity.setReceiptNumber(nextReceiptNumber());
        pagoRepository.save(entity); return toDto(entity);
    }

    private void validate(PaymentDto dto) {
        if (dto.getPatientId() == null || !pacienteRepository.existsById(dto.getPatientId())) {
            throw ApiException.badRequest("Selecciona un paciente válido.");
        }
        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw ApiException.badRequest("El monto del pago debe ser mayor que cero.");
        }
    }

    private void applyInput(Pago entity, PaymentDto dto) {
        entity.setPatientId(dto.getPatientId());
        entity.setAppointmentId(dto.getAppointmentId());
        entity.setConcept(dto.getConcept());
        entity.setTreatment(dto.getTreatment());
        entity.setDate(dto.getDate() != null && !dto.getDate().isBlank() ? LocalDate.parse(dto.getDate()) : LocalDate.now());
        entity.setAmount(dto.getAmount());
        entity.setCurrency(dto.getCurrency() == null || dto.getCurrency().isBlank() ? "GTQ" : dto.getCurrency());
        entity.setMethod(dto.getMethod());
        entity.setReference(dto.getReference());
        entity.setNotes(dto.getNotes());
        entity.setReceipt(dto.isReceipt());
        entity.setStatus("Registrado");
    }

    private String nextReceiptNumber() {
        long latest = pagoRepository.findFirstByReceiptNumberIsNotNullOrderByReceiptNumberDesc()
                .map(p -> {
                    String[] parts = p.getReceiptNumber().split("-");
                    try {
                        return Long.parseLong(parts[parts.length - 1]);
                    } catch (NumberFormatException e) {
                        return 0L;
                    }
                })
                .orElse(0L);
        return "CP-" + LocalDate.now().getYear() + "-" + String.format("%06d", latest + 1);
    }

    private PaymentDto toDto(Pago entity) {
        PaymentDto dto = new PaymentDto();
        dto.setId(entity.getId());
        dto.setPatientId(entity.getPatientId());
        dto.setAppointmentId(entity.getAppointmentId());
        dto.setConcept(entity.getConcept());
        dto.setTreatment(entity.getTreatment());
        dto.setDate(entity.getDate() != null ? entity.getDate().toString() : null);
        dto.setAmount(entity.getAmount());
        dto.setCurrency(entity.getCurrency());
        dto.setMethod(entity.getMethod());
        dto.setReference(entity.getReference());
        dto.setNotes(entity.getNotes());
        dto.setReceipt(entity.isReceipt());
        dto.setStatus(entity.getStatus());
        dto.setReceiptNumber(entity.getReceiptNumber());
        dto.setRegistradoPor(entity.getRegistradoPor());
        dto.setFechaCreacion(entity.getFechaCreacion() != null ? entity.getFechaCreacion().format(TS) : null);
        return dto;
    }

    private void allocate(Pago payment, List<PaymentAllocationInput> requested) {
        BigDecimal remaining = payment.getAmount();
        List<PaymentAllocationInput> inputs = requested == null ? new ArrayList<>() : requested;
        if (inputs.isEmpty()) {
            chargeRepository.findPendingForPatient(payment.getPatientId(), payment.getAppointmentId())
                    .forEach(c -> inputs.add(new PaymentAllocationInput(c.getId(), null)));
        }
        for (PaymentAllocationInput input : inputs) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            Cargo charge = chargeRepository.findById(input.getChargeId())
                    .orElseThrow(() -> ApiException.notFound("El cargo no existe."));
            if (!payment.getPatientId().equals(charge.getPatientId()) || "Anulado".equals(charge.getStatus()))
                throw ApiException.badRequest("El cargo no pertenece a la cuenta del paciente.");
            BigDecimal balance = charge.getSubtotal().subtract(allocationRepository.totalForCharge(charge.getId()));
            BigDecimal requestedAmount = input.getAmount() == null ? balance : input.getAmount();
            if (requestedAmount.compareTo(BigDecimal.ZERO) <= 0 || requestedAmount.compareTo(balance) > 0 || requestedAmount.compareTo(remaining) > 0)
                throw ApiException.badRequest("La asignación supera el saldo disponible.");
            PaymentAllocation allocation = new PaymentAllocation();
            allocation.setId(UUID.randomUUID().toString()); allocation.setPaymentId(payment.getId());
            allocation.setChargeId(charge.getId()); allocation.setAmount(requestedAmount);
            allocationRepository.save(allocation);
            remaining = remaining.subtract(requestedAmount);
        }
        if (remaining.compareTo(BigDecimal.ZERO) > 0)
            throw ApiException.badRequest("El pago debe aplicarse a cargos pendientes; no se admiten créditos sin asignar.");
    }
}
