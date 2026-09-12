package com.ortos.api.controller;

import com.ortos.api.dto.ClinicalHistoryDto;
import com.ortos.api.security.AccessGuard;
import com.ortos.api.security.CurrentUser;
import com.ortos.api.service.ClinicalHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinical-history")
public class ClinicalHistoryController {

    private final ClinicalHistoryService clinicalHistoryService;

    public ClinicalHistoryController(ClinicalHistoryService clinicalHistoryService) {
        this.clinicalHistoryService = clinicalHistoryService;
    }

    @GetMapping
    public List<ClinicalHistoryDto> findByPatient(@RequestParam String patientId) {
        AccessGuard.requireReadAccess(CurrentUser.get(), patientId);
        return clinicalHistoryService.findByPatient(patientId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClinicalHistoryDto create(@RequestBody ClinicalHistoryDto dto) {
        AccessGuard.requireStaff(CurrentUser.get());
        return clinicalHistoryService.create(dto);
    }
}
