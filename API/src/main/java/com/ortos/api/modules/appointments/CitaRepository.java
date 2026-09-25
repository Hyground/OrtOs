package com.ortos.api.modules.appointments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface CitaRepository extends JpaRepository<Cita, UUID> {
    List<Cita> findByPatientId(String patientId);
    boolean existsByPatientId(String patientId);
    List<Cita> findByDoctorId(String doctorId);
    List<Cita> findByAppointmentAtGreaterThanEqualAndAppointmentAtLessThan(OffsetDateTime from, OffsetDateTime to);

    @Query("select c from Cita c where (:patientId is null or c.patientId = :patientId) " +
            "and (:doctorId is null or c.doctorId = :doctorId) " +
            "and (:statusId is null or c.statusId = :statusId) " +
            "and (:from is null or c.appointmentAt >= :from) " +
            "and (:to is null or c.appointmentAt < :to) order by c.appointmentAt asc")
    List<Cita> search(@Param("patientId") String patientId, @Param("doctorId") String doctorId,
                      @Param("statusId") Short statusId, @Param("from") OffsetDateTime from,
                      @Param("to") OffsetDateTime to);

    @Query("select c from Cita c, AppointmentStatus s where c.statusId = s.id " +
            "and c.doctorId = :doctorId and c.appointmentAt = :appointmentAt " +
            "and lower(s.name) in :blockingStatusNames " +
            "and (:excludeId is null or c.id <> :excludeId)")
    List<Cita> findBlockingAtSlot(@Param("doctorId") String doctorId,
                                  @Param("appointmentAt") OffsetDateTime appointmentAt,
                                  @Param("excludeId") UUID excludeId,
                                  @Param("blockingStatusNames") java.util.Collection<String> blockingStatusNames);

    @Query("select c from Cita c, AppointmentStatus s where c.statusId = s.id " +
            "and c.doctorId = :doctorId and c.appointmentAt >= :from and c.appointmentAt < :to " +
            "and lower(s.name) in :blockingStatusNames order by c.appointmentAt asc")
    List<Cita> findBlockingInRange(@Param("doctorId") String doctorId, @Param("from") OffsetDateTime from,
                                   @Param("to") OffsetDateTime to,
                                   @Param("blockingStatusNames") java.util.Collection<String> blockingStatusNames);

    default long countByTreatmentIgnoreCase(String treatment) {
        return 0;
    }
}
