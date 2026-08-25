package com.ortos.api.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SaludoController {
    @GetMapping("/saludo")
    public Map<String, String> saludo() {
        return Map.of("mensaje", "Hola desde Spring Boot");
    }
}

