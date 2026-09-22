package com.ortos.api.modules.clinical;

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
