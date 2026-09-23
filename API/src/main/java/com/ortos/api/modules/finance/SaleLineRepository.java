package com.ortos.api.modules.finance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SaleLineRepository extends JpaRepository<SaleLine, String> { List<SaleLine> findBySaleIdOrderById(String saleId); }
