package com.ortos.api.modules.finance;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface InstallmentRepository extends JpaRepository<Installment, String> { List<Installment> findByPaymentPlanIdOrderByNumber(String paymentPlanId); }
