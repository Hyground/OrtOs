package com.ortos.api.modules.staff;

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
    private boolean active = true;
    private String medicoId;
    private String patientId;
}
