package com.ortos.api.modules.finance;

import com.ortos.api.modules.patients.PacienteRepository;
import com.ortos.api.shared.security.AuthenticatedUser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PaymentServiceTest {
    @Mock private PagoRepository payments;
    @Mock private PacienteRepository patients;
    @Mock private ChargeRepository charges;
    @Mock private PaymentAllocationRepository allocations;
    @InjectMocks private PaymentService service;

    @Test
    void appliesFiveHundredAcrossTwoChargesWithoutOverpaying() {
        Cargo first = charge("charge-a", "300.00");
        Cargo second = charge("charge-b", "400.00");
        when(patients.existsById("patient-1")).thenReturn(true);
        when(payments.findFirstByReceiptNumberIsNotNullOrderByReceiptNumberDesc()).thenReturn(Optional.empty());
        when(charges.findPendingForPatient("patient-1", null)).thenReturn(List.of(first, second));
        when(charges.findById("charge-a")).thenReturn(Optional.of(first));
        when(charges.findById("charge-b")).thenReturn(Optional.of(second));
        when(allocations.totalForCharge(anyString())).thenReturn(BigDecimal.ZERO);

        PaymentDto request = new PaymentDto();
        request.setPatientId("patient-1"); request.setAmount(new BigDecimal("500.00")); request.setMethod("efectivo");
        service.create(request, new AuthenticatedUser("staff-1", "staff@ortos.test", "Staff", "admin", null));

        ArgumentCaptor<PaymentAllocation> saved = ArgumentCaptor.forClass(PaymentAllocation.class);
        org.mockito.Mockito.verify(allocations, org.mockito.Mockito.times(2)).save(saved.capture());
        assertEquals(new BigDecimal("300.00"), saved.getAllValues().get(0).getAmount());
        assertEquals(new BigDecimal("200.00"), saved.getAllValues().get(1).getAmount());
    }

    private Cargo charge(String id, String subtotal) {
        Cargo charge = new Cargo(); charge.setId(id); charge.setPatientId("patient-1");
        charge.setSubtotal(new BigDecimal(subtotal)); charge.setStatus("Pendiente"); return charge;
    }
}
