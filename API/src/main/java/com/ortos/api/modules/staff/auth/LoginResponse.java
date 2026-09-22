package com.ortos.api.modules.staff.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private final String token;
    private final AuthUserDto user;
}
