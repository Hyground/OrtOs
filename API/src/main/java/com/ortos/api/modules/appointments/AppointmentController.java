package com.ortos.api.modules.appointments;

import com.ortos.api.shared.security.AccessGuard;
import com.ortos.api.shared.security.AuthenticatedUser;
import com.ortos.api.shared.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
public class AppointmentController {
    private final AppointmentService service;
    public AppointmentController(AppointmentService service) { this.service = service; }
    @GetMapping("/api/appointments") public List<AppointmentDto> all(@RequestParam(required=false) String patientId, @RequestParam(required=false) String doctorId, @RequestParam(required=false) Short statusId, @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date) { AuthenticatedUser user=CurrentUser.get(); AccessGuard.requireAuthenticated(user); return service.findAll(user.isPaciente()?user.patientId():patientId,doctorId,statusId,date); }
    @GetMapping("/api/appointments/{id}") public AppointmentDto one(@PathVariable String id) { AppointmentDto dto=service.findById(id); AccessGuard.requireBasicReadAccess(CurrentUser.get(),dto.getPatientId()); return dto; }
    @GetMapping("/api/appointments/patient/{patientId}") public List<AppointmentDto> patient(@PathVariable String patientId) { AccessGuard.requireBasicReadAccess(CurrentUser.get(),patientId); return service.findByPatient(patientId); }
    @GetMapping("/api/appointments/doctor/{doctorId}") public List<AppointmentDto> doctor(@PathVariable String doctorId) { AccessGuard.requireAuthenticated(CurrentUser.get()); return service.findByDoctor(doctorId); }
    @GetMapping("/api/appointments/date") public List<AppointmentDto> date(@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date) { AccessGuard.requireAuthenticated(CurrentUser.get()); return service.findByDate(date); }
    @PostMapping("/api/appointments") @ResponseStatus(HttpStatus.CREATED) public AppointmentDto create(@Valid @RequestBody AppointmentDto dto) { AuthenticatedUser user=CurrentUser.get(); AccessGuard.requireBasicStaff(user); return service.create(dto,user); }
    @PutMapping("/api/appointments/{id}") public AppointmentDto update(@PathVariable String id,@Valid @RequestBody AppointmentDto dto) { AccessGuard.requireBasicStaff(CurrentUser.get()); return service.update(id,dto); }
    @PatchMapping("/api/appointments/{id}/status") public AppointmentDto status(@PathVariable String id,@RequestBody Map<String,String> body) { AccessGuard.requireBasicStaff(CurrentUser.get()); return service.updateStatus(id,body.get("status")); }
    @DeleteMapping("/api/appointments/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable String id) { AccessGuard.requireBasicStaff(CurrentUser.get()); service.delete(id); }
    @GetMapping("/api/appointment-types") public List<AppointmentType> types() { AccessGuard.requireAuthenticated(CurrentUser.get()); return service.findTypes(); }
    @GetMapping("/api/appointment-priorities") public List<AppointmentPriority> priorities() { AccessGuard.requireAuthenticated(CurrentUser.get()); return service.findPriorities(); }
    @GetMapping("/api/appointment-statuses") public List<AppointmentStatus> statuses() { AccessGuard.requireAuthenticated(CurrentUser.get()); return service.findStatuses(); }
}
