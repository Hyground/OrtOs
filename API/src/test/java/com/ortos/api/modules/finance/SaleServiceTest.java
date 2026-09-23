package com.ortos.api.modules.finance;

import com.ortos.api.modules.clinical.Tratamiento;
import com.ortos.api.modules.clinical.TratamientoRepository;
import com.ortos.api.modules.patients.PacienteRepository;
import com.ortos.api.modules.staff.MedicoRepository;
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
class SaleServiceTest {
    @Mock private SaleRepository sales;
    @Mock private SaleLineRepository lines;
    @Mock private SaleChargeRepository charges;
    @Mock private SaleAppointmentRepository appointments;
    @Mock private PacienteRepository patients;
    @Mock private TratamientoRepository treatments;
    @Mock private MedicoRepository doctors;
    @Mock private PaymentService paymentService;
    @Mock private PaymentAllocationRepository allocations;
    @Mock private PaymentPlanRepository plans;
    @Mock private InstallmentRepository installments;
    @Mock private PaymentPlanChargeRepository planCharges;
    @InjectMocks private SaleService service;

    @Test
    void createsThreeChargesForTheSaleAndPreservesTheirSnapshots() {
        preparePersistence();
        when(treatments.findById("consultation")).thenReturn(Optional.of(treatment("consultation", "Consulta", "150")));
        when(treatments.findById("bands")).thenReturn(Optional.of(treatment("bands", "Cambio de hules", "75")));
        when(treatments.findById("xray")).thenReturn(Optional.of(treatment("xray", "Radiografía", "120")));
        PaymentDto downPayment = new PaymentDto(); downPayment.setAmount(new BigDecimal("100.00"));
        when(paymentService.create(any(), any())).thenReturn(downPayment);

        SaleDto sale = service.create(sale("100"), actor());

        assertEquals(new BigDecimal("345.00"), sale.getTotal());
        assertEquals(3, sale.getCharges().size());
        assertEquals(new BigDecimal("100.00"), sale.getDownPayment().getAmount());
    }

    @Test
    void createsPlanForExistingSaleBalanceWithoutCreatingAnotherCharge() {
        preparePersistence();
        when(treatments.findById("ortho")).thenReturn(Optional.of(treatment("ortho", "Ortodoncia", "2400")));
        when(allocations.totalForCharge(anyString())).thenReturn(new BigDecimal("600.00"));

        SaleRequest request = new SaleRequest(); request.setPatientId("patient-1");
        SaleLineRequest line = new SaleLineRequest(); line.setTreatmentId("ortho"); request.setLines(List.of(line));
        SalePaymentRequest payment = new SalePaymentRequest(); payment.setAmount(new BigDecimal("600")); request.setDownPayment(payment);
        SalePlanRequest plan = new SalePlanRequest(); plan.setFinancedAmount(new BigDecimal("1800")); plan.setInstallmentCount(6); request.setPaymentPlan(plan);
        SaleDto sale = service.create(request, actor());

        assertEquals(new BigDecimal("2400.00"), sale.getTotal());
        assertEquals(new BigDecimal("1800.00"), sale.getPaymentPlan().getFinancedAmount());
        org.mockito.Mockito.verify(installments, org.mockito.Mockito.times(6)).save(any());
        ArgumentCaptor<SaleCharge> savedCharges = ArgumentCaptor.forClass(SaleCharge.class);
        org.mockito.Mockito.verify(charges).save(savedCharges.capture());
        assertEquals(0, savedCharges.getValue().getSubtotal().compareTo(new BigDecimal("2400.00")));
    }

    private void preparePersistence() {
        when(patients.existsById("patient-1")).thenReturn(true);
        when(sales.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(lines.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(charges.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(plans.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(installments.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(planCharges.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(allocations.totalForCharge(anyString())).thenReturn(BigDecimal.ZERO);
    }

    private SaleRequest sale(String downPayment) {
        SaleRequest request = new SaleRequest(); request.setPatientId("patient-1");
        request.setLines(List.of(line("consultation"), line("bands"), line("xray")));
        SalePaymentRequest payment = new SalePaymentRequest(); payment.setAmount(new BigDecimal(downPayment)); request.setDownPayment(payment); return request;
    }
    private SaleLineRequest line(String treatmentId) { SaleLineRequest line = new SaleLineRequest(); line.setTreatmentId(treatmentId); return line; }
    private Tratamiento treatment(String id, String name, String price) { Tratamiento t = new Tratamiento(); t.setId(id); t.setName(name); t.setPrice(new BigDecimal(price)); t.setActive(true); return t; }
    private AuthenticatedUser actor() { return new AuthenticatedUser("staff-1", "staff@ortos.test", "Staff", "admin", null); }
}
