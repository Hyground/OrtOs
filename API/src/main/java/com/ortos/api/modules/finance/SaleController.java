package com.ortos.api.modules.finance;

import com.ortos.api.shared.security.AccessGuard;
import com.ortos.api.shared.security.AuthenticatedUser;
import com.ortos.api.shared.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
public class SaleController {
    private final SaleService service;
    public SaleController(SaleService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SaleDto create(@RequestBody SaleRequest request) {
        AuthenticatedUser actor = CurrentUser.get();
        AccessGuard.requireBasicStaff(actor);
        return service.create(request, actor);
    }
}
