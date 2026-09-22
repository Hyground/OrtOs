package com.ortos.api.modules.finance;

import com.ortos.api.modules.finance.PaymentDto;
import com.ortos.api.shared.security.AccessGuard;
import com.ortos.api.shared.security.AuthenticatedUser;
import com.ortos.api.shared.security.CurrentUser;
import com.ortos.api.modules.finance.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<PaymentDto> findAll() {
        AuthenticatedUser user = CurrentUser.get();
        AccessGuard.requireAuthenticated(user);
        List<PaymentDto> all = paymentService.findAll();
        if (user.isPaciente()) {
            return all.stream().filter(p -> p.getPatientId().equals(user.patientId())).toList();
        }
        return all;
    }

    @GetMapping("/{id}")
    public PaymentDto findById(@PathVariable String id) {
        PaymentDto dto = paymentService.findById(id);
        AccessGuard.requireBasicReadAccess(CurrentUser.get(), dto.getPatientId());
        return dto;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentDto create(@RequestBody PaymentDto dto) {
        AuthenticatedUser user = CurrentUser.get();
        AccessGuard.requireBasicStaff(user);
        return paymentService.create(dto, user);
    }

    @PutMapping("/{id}")
    public PaymentDto update(@PathVariable String id, @RequestBody PaymentDto dto) {
        AccessGuard.requireBasicStaff(CurrentUser.get());
        return paymentService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        AccessGuard.requireBasicStaff(CurrentUser.get());
        paymentService.delete(id);
    }
}
