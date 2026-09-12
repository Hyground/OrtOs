package com.ortos.api.controller;

import com.ortos.api.dto.DoctorDto;
import com.ortos.api.security.AccessGuard;
import com.ortos.api.security.CurrentUser;
import com.ortos.api.service.DoctorService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<DoctorDto> findAll() {
        AccessGuard.requireAuthenticated(CurrentUser.get());
        return doctorService.findAll();
    }

    @GetMapping("/{id}")
    public DoctorDto findById(@PathVariable String id) {
        AccessGuard.requireAuthenticated(CurrentUser.get());
        return doctorService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DoctorDto create(@RequestBody DoctorDto dto) {
        AccessGuard.requireStaff(CurrentUser.get());
        return doctorService.create(dto);
    }

    @PutMapping("/{id}")
    public DoctorDto update(@PathVariable String id, @RequestBody DoctorDto dto) {
        AccessGuard.requireStaff(CurrentUser.get());
        return doctorService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        AccessGuard.requireStaff(CurrentUser.get());
        doctorService.delete(id);
    }
}
