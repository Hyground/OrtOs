package com.ortos.api.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @NotBlank(message = "Ingresa tu correo.")
    private String email;

    @NotBlank(message = "Ingresa tu contraseña.")
    private String password;
}
