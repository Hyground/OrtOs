package com.ortos.api.modules.finance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PaymentPlanChargeRepository extends JpaRepository<PaymentPlanCharge, PaymentPlanCharge.Key> { List<PaymentPlanCharge> findByPaymentPlanId(String paymentPlanId); }
