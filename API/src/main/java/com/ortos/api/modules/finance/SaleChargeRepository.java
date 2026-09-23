package com.ortos.api.modules.finance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SaleChargeRepository extends JpaRepository<SaleCharge, String> { List<SaleCharge> findBySaleIdOrderByCreatedAtAsc(String saleId); }
