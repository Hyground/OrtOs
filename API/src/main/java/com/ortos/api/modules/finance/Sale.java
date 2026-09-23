package com.ortos.api.modules.finance;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales")
@Getter @Setter
public class Sale {
    @Id private String id;
    @Column(name = "patient_id", nullable = false) private String patientId;
    @Column(name = "registered_by") private String registeredBy;
    @Column(name = "sale_date", nullable = false) private LocalDate saleDate;
    @Column(nullable = false) private String status = "Registrada";
    @Column(name = "created_at", nullable = false) private LocalDateTime createdAt;
}
