package com.ortos.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSaveRequest {
    private String id;
    private String displayName;
    private String email;
    private String password;
    private String role;
    private boolean active;
    private String medicoId;
    private String patientId;
}
