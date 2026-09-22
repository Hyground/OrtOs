package com.ortos.api.modules.clinical;

import com.ortos.api.modules.clinical.ClinicalHistoryDto;
import com.ortos.api.shared.security.AccessGuard;
import com.ortos.api.shared.security.CurrentUser;
import com.ortos.api.modules.clinical.ClinicalHistoryService;
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
