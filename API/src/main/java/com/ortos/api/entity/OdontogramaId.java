package com.ortos.api.entity;

import java.io.Serializable;
import java.util.Objects;

public class OdontogramaId implements Serializable {
    private String patientId;
    private Integer toothNumber;
    private String surface;

    public OdontogramaId() {}

    public OdontogramaId(String patientId, Integer toothNumber, String surface) {
        this.patientId = patientId;
        this.toothNumber = toothNumber;
        this.surface = surface;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OdontogramaId that)) return false;
        return Objects.equals(patientId, that.patientId)
                && Objects.equals(toothNumber, that.toothNumber)
                && Objects.equals(surface, that.surface);
    }

    @Override
    public int hashCode() {
        return Objects.hash(patientId, toothNumber, surface);
    }
}
