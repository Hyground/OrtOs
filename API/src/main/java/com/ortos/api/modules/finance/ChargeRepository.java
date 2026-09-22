package com.ortos.api.modules.finance;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface ChargeRepository extends JpaRepository<Cargo, String> {
    List<Cargo> findByPatientIdOrderByCreatedAtDesc(String patientId);
    List<Cargo> findByAppointmentIdOrderByCreatedAtDesc(String appointmentId);
    @Query("select c from Cargo c where c.patientId = :patientId and c.status <> 'Anulado' and (:appointmentId is null or c.appointmentId = :appointmentId) order by c.createdAt")
    List<Cargo> findPendingForPatient(@Param("patientId") String patientId, @Param("appointmentId") String appointmentId);
}
