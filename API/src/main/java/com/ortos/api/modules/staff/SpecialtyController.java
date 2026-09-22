package com.ortos.api.modules.staff;

import com.ortos.api.modules.staff.SpecialtyDto;
import com.ortos.api.shared.security.AccessGuard;
import com.ortos.api.shared.security.CurrentUser;
import com.ortos.api.modules.staff.SpecialtyService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialties")
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    public SpecialtyController(SpecialtyService specialtyService) {
        this.specialtyService = specialtyService;
    }

    @GetMapping
    public List<SpecialtyDto> findAll() {
        AccessGuard.requireAuthenticated(CurrentUser.get());
        return specialtyService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SpecialtyDto create(@RequestBody SpecialtyDto dto) {
        AccessGuard.requireStaff(CurrentUser.get());
        return specialtyService.create(dto);
    }

    @PutMapping("/{id}")
    public SpecialtyDto update(@PathVariable String id, @RequestBody SpecialtyDto dto) {
        AccessGuard.requireStaff(CurrentUser.get());
        return specialtyService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        AccessGuard.requireStaff(CurrentUser.get());
        specialtyService.delete(id);
    }
}
