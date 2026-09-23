package com.ortos.api.modules.finance;

import com.ortos.api.shared.security.AccessGuard;
import com.ortos.api.shared.security.CurrentUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/financial-accounts")
public class FinancialAccountController {
    private final FinancialAccountService service;
    public FinancialAccountController(FinancialAccountService service) { this.service = service; }

    @GetMapping("/{patientId}")
    public PatientAccountDto account(@PathVariable String patientId) {
        AccessGuard.requireBasicReadAccess(CurrentUser.get(), patientId);
        return service.account(patientId);
    }
}
