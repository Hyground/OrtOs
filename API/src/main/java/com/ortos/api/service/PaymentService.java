package com.ortos.api.service;

import com.ortos.api.dto.PaymentDto;
import com.ortos.api.entity.Pago;
import com.ortos.api.exception.ApiException;
import com.ortos.api.repository.PacienteRepository;
import com.ortos.api.repository.PagoRepository;
import com.ortos.api.security.AuthenticatedUser;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PagoRepository pagoRepository;
    private final PacienteRepository pacienteRepository;
    private static final DateTimeFormatter TS = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public PaymentService(PagoRepository pagoRepository, PacienteRepository pacienteRepository) {
        this.pagoRepository = pagoRepository;
        this.pacienteRepository = pacienteRepository;
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

    public PaymentDto create(PaymentDto dto, AuthenticatedUser actor) {
        validate(dto);
        Pago entity = new Pago();
        entity.setId(UUID.randomUUID().toString());
        applyInput(entity, dto);
        entity.setReceiptNumber(dto.isReceipt() ? nextReceiptNumber() : null);
        entity.setRegistradoPor(actor != null ? actor.id() : null);
        entity.setFechaCreacion(LocalDateTime.now());
        pagoRepository.save(entity);
        return toDto(entity);
    }

    public PaymentDto update(String id, PaymentDto dto) {
        validate(dto);
        Pago entity = getEntity(id);
        applyInput(entity, dto);
        if (dto.isReceipt() && entity.getReceiptNumber() == null) {
            entity.setReceiptNumber(nextReceiptNumber());
        } else if (!dto.isReceipt()) {
            entity.setReceiptNumber(null);
        }
        pagoRepository.save(entity);
        return toDto(entity);
    }

    public void delete(String id) {
        getEntity(id);
        pagoRepository.deleteById(id);
    }

    private void validate(PaymentDto dto) {
        if (dto.getPatientId() == null || !pacienteRepository.existsById(dto.getPatientId())) {
            throw ApiException.badRequest("Selecciona un paciente válido.");
        }
        if (dto.getAmount() == null) {
            throw ApiException.badRequest("Ingresa el monto del pago.");
        }
    }

    private void applyInput(Pago entity, PaymentDto dto) {
        entity.setPatientId(dto.getPatientId());
        entity.setConcept(dto.getConcept());
        entity.setTreatment(dto.getTreatment());
        entity.setDate(dto.getDate() != null && !dto.getDate().isBlank() ? LocalDate.parse(dto.getDate()) : LocalDate.now());
        entity.setAmount(dto.getAmount());
        entity.setCurrency(dto.getCurrency() == null || dto.getCurrency().isBlank() ? "GTQ" : dto.getCurrency());
        entity.setMethod(dto.getMethod());
        entity.setReference(dto.getReference());
        entity.setNotes(dto.getNotes());
        entity.setReceipt(dto.isReceipt());
        entity.setStatus(dto.getStatus() == null || dto.getStatus().isBlank() ? "Pendiente" : dto.getStatus());
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
}
