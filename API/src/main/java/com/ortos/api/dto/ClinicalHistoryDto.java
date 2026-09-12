package com.ortos.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClinicalHistoryDto {
    private String id;
    private String patientId;
    private String date;
    private String treatment;
    private String dentist;
    private String notes;
}
