package com.ortos.api.modules.staff;

import com.ortos.api.shared.config.SecurityConfig;
import com.ortos.api.shared.security.JwtAuthenticationFilter;
import com.ortos.api.shared.security.JwtService;
import com.ortos.api.shared.security.RestAuthEntryPoints;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {SpecialtyController.class, DoctorController.class, UserController.class},
        properties = "ortos.jwt.secret=staff-tests-only-secret-with-at-least-32-bytes")
@Import({SpecialtyService.class, DoctorService.class, UserService.class, SecurityConfig.class,
        JwtService.class, JwtAuthenticationFilter.class, RestAuthEntryPoints.class, StaffExceptionHandler.class})
class StaffHttpTest {
    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @MockitoBean EspecialidadRepository specialties;
    @MockitoBean MedicoRepository doctors;
    @MockitoBean UsuarioRepository users;
    private Usuario user;

    @BeforeEach void records() {
        Especialidad specialty = new Especialidad();
        specialty.setId("s1"); specialty.setName("General");
        Medico doctor = new Medico();
        doctor.setId("d1"); doctor.setNames("Ana"); doctor.setSurnames("Lopez");
        doctor.setSpecialty("General");
        user = new Usuario();
        user.setId("u1"); user.setDisplayName("Asistente"); user.setEmail("asistente@example.test");
        user.setRole("asistente"); user.setPasswordHash("must-not-be-exposed");
        when(specialties.findById("s1")).thenReturn(Optional.of(specialty));
        when(doctors.findById("d1")).thenReturn(Optional.of(doctor));
        when(doctors.existsById("d1")).thenReturn(true);
        when(users.findById("u1")).thenReturn(Optional.of(user));
        when(users.count()).thenReturn(1L);
        when(specialties.findAll()).thenReturn(List.of(specialty));
        when(doctors.findAll()).thenReturn(List.of(doctor));
        when(users.findAll()).thenReturn(List.of(user));
    }

    private String token(String role) {
        Usuario actor = new Usuario(); actor.setId("actor"); actor.setRole(role);
        actor.setEmail("actor@example.test"); actor.setDisplayName("Actor");
        return "Bearer " + jwt.generateToken(actor);
    }

    private String userJson(String role) {
        return """
                {"displayName":"Nuevo","email":" NEW@example.test ","role":"%s","password":"Password123"}
                """.formatted(role);
    }

    @Test void allThreeResourcesSupportCompleteCrud() throws Exception {
        String[] routes = {"specialties", "doctors", "users"};
        String[] ids = {"s1", "d1", "u1"};
        String[] bodies = {"{\"name\":\"General\",\"description\":\"Consulta\"}",
                "{\"names\":\"Ana\",\"surnames\":\"Lopez\",\"specialty\":\"General\",\"photo\":\"data:image/png;base64,test\"}",
                userJson("asistente")};
        for (int i = 0; i < routes.length; i++) {
            String url = "/api/" + routes[i];
            mvc.perform(get(url).header("Authorization", token("admin")))
                    .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(ids[i]));
            mvc.perform(get(url + "/" + ids[i]).header("Authorization", token("admin")))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(ids[i]));
            mvc.perform(post(url).header("Authorization", token("admin"))
                    .contentType("application/json").content(bodies[i]))
                    .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNotEmpty())
                    .andExpect(jsonPath("$.passwordHash").doesNotExist());
            mvc.perform(put(url + "/" + ids[i]).header("Authorization", token("admin"))
                    .contentType("application/json").content(bodies[i])).andExpect(status().isOk());
            mvc.perform(delete(url + "/" + ids[i]).header("Authorization", token("admin")))
                    .andExpect(status().isNoContent());
        }
        verify(specialties).deleteById("s1");
        verify(doctors).deleteById("d1");
        verify(users).deleteById("u1");
        verify(users, times(2)).save(argThat(saved -> saved.getPasswordHash().startsWith("$2")
                && saved.getEmail().equals("new@example.test")));
    }

    @Test void anonymousReadsAndNonAdminUserCreationAreRejected() throws Exception {
        for (String route : List.of("specialties", "doctors", "users")) {
            mvc.perform(get("/api/" + route)).andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/api/users").header("Authorization", token("paciente"))
                .contentType("application/json").content(userJson("admin"))).andExpect(status().isForbidden());
        mvc.perform(post("/api/doctors").header("Authorization", token("paciente"))
                .contentType("application/json").content("{}")).andExpect(status().isForbidden());
        mvc.perform(get("/api/users").header("Authorization", token("odontologo")))
                .andExpect(status().isForbidden());
    }

    @Test void initialAdministratorCanBeCreatedOnlyWhileUsersIsEmpty() throws Exception {
        when(users.count()).thenReturn(0L);
        mvc.perform(post("/api/users").contentType("application/json").content(userJson("admin")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.active").value(true));
        verify(users).lockAccountWrites();
        when(users.count()).thenReturn(1L);
        mvc.perform(post("/api/users").contentType("application/json").content(userJson("admin")))
                .andExpect(status().isUnauthorized());
        verify(users, times(1)).save(any());
    }

    @Test void bootstrapRejectsNonAdminAndInactiveAccounts() throws Exception {
        when(users.count()).thenReturn(0L);
        for (String body : List.of("{\"role\":\"paciente\",\"active\":true}",
                "{\"role\":\"admin\",\"active\":false}")) {
            mvc.perform(post("/api/users").contentType("application/json").content(body))
                    .andExpect(status().isBadRequest());
        }
        verify(users, never()).save(any());
    }

    @Test void specialtyDuplicateCheckUsesTrimmedName() throws Exception {
        when(specialties.existsByNameIgnoreCase("General")).thenReturn(true);
        mvc.perform(post("/api/specialties").header("Authorization", token("admin"))
                .contentType("application/json").content("{\"name\":\" General \"}"))
                .andExpect(status().isConflict());
        verify(specialties, never()).save(any());
    }

    @Test void missingSurnamesAndInvalidStatusAreRejected() throws Exception {
        for (String body : List.of("{\"names\":\"Ana\"}",
                "{\"names\":\"Ana\",\"surnames\":\"Lopez\",\"status\":\"Unknown\"}")) {
            mvc.perform(post("/api/doctors").header("Authorization", token("admin"))
                    .contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
        verify(doctors, never()).save(any());
    }

    @Test void suppliedDoctorAndPatientMustExist() throws Exception {
        String doctorBody = userJson("odontologo").replace("}", ",\"medicoId\":\"d1\"}");
        when(doctors.existsById("d1")).thenReturn(false);
        mvc.perform(post("/api/users").header("Authorization", token("admin"))
                .contentType("application/json").content(doctorBody)).andExpect(status().isBadRequest());
        when(doctors.existsById("d1")).thenReturn(true);
        mvc.perform(post("/api/users").header("Authorization", token("admin"))
                .contentType("application/json").content(doctorBody)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.medicoId").value("d1"));
        String patientBody = userJson("paciente").replace("}", ",\"patientId\":\"p1\"}");
        mvc.perform(post("/api/users").header("Authorization", token("admin"))
                .contentType("application/json").content(patientBody)).andExpect(status().isBadRequest());
        when(users.patientExists("p1")).thenReturn(true);
        mvc.perform(post("/api/users").header("Authorization", token("admin"))
                .contentType("application/json").content(patientBody)).andExpect(status().isCreated());
    }

    @Test void unchangedPasswordIsPreservedOnUpdate() throws Exception {
        mvc.perform(put("/api/users/u1").header("Authorization", token("admin"))
                .contentType("application/json").content(userJson("asistente").replace("Password123", "")))
                .andExpect(status().isOk());
        verify(users).save(argThat(saved -> "must-not-be-exposed".equals(saved.getPasswordHash())));
    }

    @Test void administratorCannotDeleteOrDisableOwnAccount() throws Exception {
        when(users.findById("actor")).thenReturn(Optional.of(user));
        mvc.perform(delete("/api/users/actor").header("Authorization", token("admin")))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/users/actor").header("Authorization", token("admin"))
                .contentType("application/json").content(userJson("asistente")))
                .andExpect(status().isBadRequest());
    }

    @Test void lastActiveAdministratorCannotBeDeletedOrDemoted() throws Exception {
        user.setRole("admin");
        when(users.countByRoleAndActiveTrue("admin")).thenReturn(1L);
        mvc.perform(delete("/api/users/u1").header("Authorization", token("admin")))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/users/u1").header("Authorization", token("admin"))
                .contentType("application/json").content(userJson("asistente")))
                .andExpect(status().isConflict());
    }

    @Test void assignedSpecialtyCannotBeDeletedOrRenamed() throws Exception {
        when(doctors.countBySpecialtyIgnoreCase("General")).thenReturn(1L);
        mvc.perform(delete("/api/specialties/s1").header("Authorization", token("admin")))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/specialties/s1").header("Authorization", token("admin"))
                .contentType("application/json").content("{\"name\":\"Otra\"}"))
                .andExpect(status().isConflict());
    }

    @Test void referencedRecordsReturnConflictInsteadOfServerError() throws Exception {
        doThrow(new DataIntegrityViolationException("foreign key")).when(doctors).deleteById("d1");
        mvc.perform(delete("/api/doctors/d1").header("Authorization", token("admin")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test void missingRecordsAndMalformedJsonAreReported() throws Exception {
        for (String route : List.of("specialties", "doctors", "users")) {
            mvc.perform(get("/api/" + route + "/missing").header("Authorization", token("admin")))
                    .andExpect(status().isNotFound());
        }
        mvc.perform(post("/api/users").header("Authorization", token("admin"))
                .contentType("application/json").content("{")).andExpect(status().isBadRequest());
    }

    @Test void duplicateEmailInvalidRoleAndOversizedPasswordAreRejected() throws Exception {
        mvc.perform(post("/api/users").header("Authorization", token("admin"))
                .contentType("application/json").content(userJson("superadmin"))).andExpect(status().isBadRequest());
        mvc.perform(post("/api/users").header("Authorization", token("admin"))
                .contentType("application/json").content(userJson("admin").replace("Password123", "a".repeat(73))))
                .andExpect(status().isBadRequest());
        when(users.existsByEmailIgnoreCase("new@example.test")).thenReturn(true);
        mvc.perform(post("/api/users").header("Authorization", token("admin"))
                .contentType("application/json").content(userJson("admin"))).andExpect(status().isConflict());
    }
}
