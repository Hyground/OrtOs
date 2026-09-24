package com.ortos.api.modules.staff;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ortos.api.shared.config.SecurityConfig;
import com.ortos.api.shared.exception.GlobalExceptionHandler;
import com.ortos.api.shared.security.JwtAuthenticationFilter;
import com.ortos.api.shared.security.JwtService;
import com.ortos.api.shared.security.RestAuthEntryPoints;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestComponent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Runs only against the disposable local database created from the real schema. */
@EnabledIfSystemProperty(named = "staff.postgres.tests", matches = "true")
@SpringBootTest(classes = StaffPostgresTest.StaffConfig.class)
@AutoConfigureMockMvc
class StaffPostgresTest {
    @TestComponent
    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration
    @EntityScan(basePackageClasses = Usuario.class)
    @EnableJpaRepositories(basePackageClasses = UsuarioRepository.class)
    @Import({DoctorController.class, SpecialtyController.class, UserController.class, AuthController.class,
            DoctorService.class, SpecialtyService.class, UserService.class, AuthService.class,
            SecurityConfig.class, JwtService.class, JwtAuthenticationFilter.class, RestAuthEntryPoints.class,
            StaffExceptionHandler.class, GlobalExceptionHandler.class})
    static class StaffConfig {}

    @DynamicPropertySource
    static void localDatabaseOnly(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> "jdbc:postgresql://127.0.0.1:55439/ortos_staff_test");
        properties.add("spring.datasource.username", () -> "ortos");
        properties.add("spring.datasource.password", () -> "");
        properties.add("spring.flyway.enabled", () -> "false");
        properties.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        properties.add("spring.jpa.open-in-view", () -> "false");
        properties.add("ortos.seed.enabled", () -> "false");
        properties.add("ortos.jwt.secret", () -> "staff-postgres-tests-only-secret-at-least-32-bytes");
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;

    @BeforeEach void clearDisposableDatabase() {
        jdbc.update("DELETE FROM usuarios");
        jdbc.update("DELETE FROM medicos");
        jdbc.update("DELETE FROM especialidades");
    }

    private String userBody(String name, String email, String role) {
        return """
                {"displayName":"%s","email":"%s","role":"%s","password":"TestPassword123"}
                """.formatted(name, email, role);
    }

    private JsonNode body(ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString());
    }

    private String adminToken() throws Exception {
        mvc.perform(post("/api/users").contentType("application/json")
                .content(userBody("Admin", "admin@example.test", "admin"))).andExpect(status().isCreated());
        JsonNode response = body(mvc.perform(post("/api/auth/login").contentType("application/json")
                .content("{\"email\":\"admin@example.test\",\"password\":\"TestPassword123\"}"))
                .andExpect(status().isOk()));
        return "Bearer " + response.get("token").asText();
    }

    @Test void completeCrudPersistsAndLoginIssuesAUsableToken() throws Exception {
        String token = adminToken();
        String specialty = body(mvc.perform(post("/api/specialties").header("Authorization", token)
                .contentType("application/json").content("{\"name\":\"General\"}"))
                .andExpect(status().isCreated())).get("id").asText();
        String doctor = body(mvc.perform(post("/api/doctors").header("Authorization", token)
                .contentType("application/json").content("""
                        {"names":"Ana","surnames":"Lopez","specialty":"General","phone":"1234"}
                        """))
                .andExpect(status().isCreated())).get("id").asText();
        String user = body(mvc.perform(post("/api/users").header("Authorization", token)
                .contentType("application/json").content(userBody("Ana", "ana@example.test", "odontologo")
                        .replace("}", ",\"medicoId\":\"" + doctor + "\"}")))
                .andExpect(status().isCreated())).get("id").asText();

        String[] routes = {"specialties", "doctors", "users"};
        String[] ids = {specialty, doctor, user};
        for (int i = 0; i < routes.length; i++) {
            mvc.perform(get("/api/" + routes[i]).header("Authorization", token))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(i == 2 ? 2 : 1));
            mvc.perform(get("/api/" + routes[i] + "/" + ids[i]).header("Authorization", token))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(ids[i]))
                    .andExpect(jsonPath("$.passwordHash").doesNotExist());
        }
        mvc.perform(get("/api/specialties/" + specialty).header("Authorization", token))
                .andExpect(jsonPath("$.totalMedicos").value(1));
        mvc.perform(put("/api/specialties/" + specialty).header("Authorization", token)
                .contentType("application/json").content("{\"name\":\"General\",\"description\":\"Actualizada\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/doctors/" + doctor).header("Authorization", token)
                .contentType("application/json").content("{\"names\":\"Ana Maria\",\"surnames\":\"Lopez\",\"specialty\":\"General\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/users/" + user).header("Authorization", token)
                .contentType("application/json").content(userBody("Ana Maria", "ana@example.test", "odontologo")
                        .replace("TestPassword123", "").replace("}", ",\"medicoId\":\"" + doctor + "\"}")))
                .andExpect(status().isOk());
        assertEquals("Actualizada", jdbc.queryForObject("SELECT description FROM especialidades WHERE id = ?", String.class, specialty));
        assertEquals("Ana Maria", jdbc.queryForObject("SELECT names FROM medicos WHERE id = ?", String.class, doctor));
        assertEquals("Ana Maria", jdbc.queryForObject("SELECT display_name FROM usuarios WHERE id = ?", String.class, user));
        mvc.perform(post("/api/auth/login").contentType("application/json")
                .content("{\"email\":\"ana@example.test\",\"password\":\"TestPassword123\"}"))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/doctors/" + doctor).header("Authorization", token)).andExpect(status().isConflict());
        for (int i = routes.length - 1; i >= 0; i--) {
            mvc.perform(delete("/api/" + routes[i] + "/" + ids[i]).header("Authorization", token))
                    .andExpect(status().isNoContent());
            mvc.perform(get("/api/" + routes[i] + "/" + ids[i]).header("Authorization", token))
                    .andExpect(status().isNotFound());
        }
    }

    @Test void concurrentBootstrapRequestsCreateExactlyOneAdministrator() throws Exception {
        CountDownLatch start = new CountDownLatch(1);
        var first = bootstrapAsync("first@example.test", start);
        var second = bootstrapAsync("second@example.test", start);
        start.countDown();
        List<Integer> statuses = List.of(first.get(20, TimeUnit.SECONDS), second.get(20, TimeUnit.SECONDS));
        assertTrue(statuses.contains(201));
        assertTrue(statuses.contains(401));
        assertEquals(1L, jdbc.queryForObject("SELECT count(*) FROM usuarios", Long.class));
    }

    private CompletableFuture<Integer> bootstrapAsync(String email, CountDownLatch start) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (!start.await(5, TimeUnit.SECONDS)) throw new IllegalStateException("Start timed out");
                return mvc.perform(post("/api/users").contentType("application/json")
                        .content(userBody("Admin", email, "admin"))).andReturn().getResponse().getStatus();
            } catch (Exception ex) {
                throw new IllegalStateException(ex);
            }
        });
    }
}
