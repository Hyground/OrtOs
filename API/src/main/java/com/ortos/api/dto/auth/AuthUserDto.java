package com.ortos.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthUserDto {
    private String id;
    private String email;
    private String displayName;
    private String role;
    private String patientId;
}
