package com.ortos.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
public class ToothDto {
    private Map<String, String> faces = new LinkedHashMap<>();
    private String treatment = "";
    private String notes = "";
}
