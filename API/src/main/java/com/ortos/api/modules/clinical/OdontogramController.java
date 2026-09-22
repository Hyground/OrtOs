package com.ortos.api.modules.clinical;

import com.ortos.api.modules.clinical.ToothDto;
import com.ortos.api.shared.security.AccessGuard;
import com.ortos.api.shared.security.AuthenticatedUser;
import com.ortos.api.shared.security.CurrentUser;
import com.ortos.api.modules.clinical.OdontogramService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/odontogram")
public class OdontogramController {

    private final OdontogramService odontogramService;

    public OdontogramController(OdontogramService odontogramService) {
        this.odontogramService = odontogramService;
    }

    @GetMapping("/{patientId}")
    public Map<String, ToothDto> get(@PathVariable String patientId) {
        AccessGuard.requireReadAccess(CurrentUser.get(), patientId);
        return odontogramService.getChart(patientId);
    }

    @PutMapping("/{patientId}")
    public Map<String, ToothDto> put(@PathVariable String patientId, @RequestBody Map<String, ToothDto> chart) {
        AuthenticatedUser user = CurrentUser.get();
        AccessGuard.requireStaff(user);
        return odontogramService.saveChart(patientId, chart, user);
    }
}
