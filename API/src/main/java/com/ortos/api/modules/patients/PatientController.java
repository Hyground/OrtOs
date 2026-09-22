package com.ortos.api.modules.patients;

import com.ortos.api.modules.patients.PatientDto;
import com.ortos.api.shared.security.AccessGuard;
import com.ortos.api.shared.security.AuthenticatedUser;
import com.ortos.api.shared.security.CurrentUser;
import com.ortos.api.modules.patients.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public List<PatientDto> findAll() {
        AuthenticatedUser user = CurrentUser.get();
        AccessGuard.requireAuthenticated(user);
        if (user.isPaciente()) {
            return user.patientId() == null ? List.of() : List.of(patientService.findById(user.patientId()));
        }
        return patientService.findAll();
    }

    @GetMapping("/{id}")
    public PatientDto findById(@PathVariable String id) {
        AccessGuard.requireBasicReadAccess(CurrentUser.get(), id);
        return patientService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientDto create(@RequestBody PatientDto dto) {
        AccessGuard.requireBasicStaff(CurrentUser.get());
        return patientService.create(dto);
    }

    @PutMapping("/{id}")
    public PatientDto update(@PathVariable String id, @RequestBody PatientDto dto) {
        AccessGuard.requireBasicStaff(CurrentUser.get());
        return patientService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        AccessGuard.requireBasicStaff(CurrentUser.get());
        patientService.delete(id);
    }
}
