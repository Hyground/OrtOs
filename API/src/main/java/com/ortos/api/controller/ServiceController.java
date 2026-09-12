package com.ortos.api.controller;

import com.ortos.api.dto.ServiceDto;
import com.ortos.api.security.AccessGuard;
import com.ortos.api.security.CurrentUser;
import com.ortos.api.service.ServiceCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;

    public ServiceController(ServiceCatalogService serviceCatalogService) {
        this.serviceCatalogService = serviceCatalogService;
    }

    @GetMapping
    public List<ServiceDto> findAll() {
        return serviceCatalogService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceDto create(@RequestBody ServiceDto dto) {
        AccessGuard.requireStaff(CurrentUser.get());
        return serviceCatalogService.create(dto);
    }

    @PutMapping("/{id}")
    public ServiceDto update(@PathVariable String id, @RequestBody ServiceDto dto) {
        AccessGuard.requireStaff(CurrentUser.get());
        return serviceCatalogService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        AccessGuard.requireStaff(CurrentUser.get());
        serviceCatalogService.delete(id);
    }
}
