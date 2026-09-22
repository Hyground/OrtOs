package com.ortos.api.modules.finance;
import com.ortos.api.shared.security.*; import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/patient-accounts")
public class PatientAccountController {
 private final PatientAccountService service; public PatientAccountController(PatientAccountService service){this.service=service;}
 @GetMapping("/{patientId}") public PatientAccountDto account(@PathVariable String patientId,@RequestParam(required=false) String appointmentId){AccessGuard.requireBasicReadAccess(CurrentUser.get(),patientId);return service.account(patientId,appointmentId);}
 @PostMapping("/charges") @ResponseStatus(HttpStatus.CREATED) public ChargeDto create(@RequestBody ChargeDto dto){AccessGuard.requireBasicStaff(CurrentUser.get());return service.createCharge(dto);}
 @PutMapping("/charges/{id}") public ChargeDto update(@PathVariable String id,@RequestBody ChargeDto dto){AccessGuard.requireBasicStaff(CurrentUser.get());return service.updateCharge(id,dto);}
 @PatchMapping("/charges/{id}/cancel") public ChargeDto cancel(@PathVariable String id){AccessGuard.requireBasicStaff(CurrentUser.get());return service.cancelCharge(id);}
 @PostMapping("/{patientId}/plans") @ResponseStatus(HttpStatus.CREATED) public PaymentPlanDto plan(@PathVariable String patientId,@RequestBody PaymentPlanRequest dto){AccessGuard.requireBasicStaff(CurrentUser.get());return service.createPlan(patientId,dto);}
}
