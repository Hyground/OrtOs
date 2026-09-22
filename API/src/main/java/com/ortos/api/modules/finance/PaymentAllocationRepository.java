package com.ortos.api.modules.finance;
import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.math.BigDecimal;
public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, String> {
    @Query("select coalesce(sum(a.amount), 0) from PaymentAllocation a join Pago p on p.id = a.paymentId where a.chargeId = :chargeId and p.status <> 'Anulado'")
    BigDecimal totalForCharge(@Param("chargeId") String chargeId);
}
