package com.ortos.api.controller;

import com.ortos.api.dto.AppointmentDto;
import com.ortos.api.security.AccessGuard;
import com.ortos.api.security.AuthenticatedUser;
import com.ortos.api.security.CurrentUser;
import com.ortos.api.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public List<AppointmentDto> findAll() {
        AuthenticatedUser user = CurrentUser.get();
        AccessGuard.requireAuthenticated(user);
        List<AppointmentDto> all = appointmentService.findAll();
        if (user.isPaciente()) {
            return all.stream().filter(a -> a.getPatientId().equals(user.patientId())).toList();
        }
        return all;
    }

    @GetMapping("/{id}")
    public AppointmentDto findById(@PathVariable String id) {
        AppointmentDto dto = appointmentService.findById(id);
        AccessGuard.requireBasicReadAccess(CurrentUser.get(), dto.getPatientId());
        return dto;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentDto create(@RequestBody AppointmentDto dto) {
        AuthenticatedUser user = CurrentUser.get();
        AccessGuard.requireBasicStaff(user);
        return appointmentService.create(dto, user);
    }

    @PutMapping("/{id}")
    public AppointmentDto update(@PathVariable String id, @RequestBody AppointmentDto dto) {
        AccessGuard.requireBasicStaff(CurrentUser.get());
        return appointmentService.update(id, dto);
    }

    @PatchMapping("/{id}/status")
    public AppointmentDto updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        AccessGuard.requireBasicStaff(CurrentUser.get());
        return appointmentService.updateStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        AccessGuard.requireBasicStaff(CurrentUser.get());
        appointmentService.delete(id);
    }
}
