package com.ortos.api.controller;

import com.ortos.api.dto.auth.AuthUserDto;
import com.ortos.api.dto.auth.LoginRequest;
import com.ortos.api.dto.auth.LoginResponse;
import com.ortos.api.dto.auth.PasswordResetRequest;
import com.ortos.api.exception.ApiException;
import com.ortos.api.security.AccessGuard;
import com.ortos.api.security.CurrentUser;
import com.ortos.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }

    @PostMapping("/login/google")
    public LoginResponse loginWithGoogle() {
        throw ApiException.notImplemented("El inicio de sesión con Google todavía no está disponible.");
    }

    @GetMapping("/me")
    public AuthUserDto me() {
        AccessGuard.requireAuthenticated(CurrentUser.get());
        return authService.me(CurrentUser.get().id());
    }

    @PostMapping("/password-reset")
    @ResponseStatus(org.springframework.http.HttpStatus.OK)
    public void requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        authService.requestPasswordReset(request.getEmail());
    }
}
