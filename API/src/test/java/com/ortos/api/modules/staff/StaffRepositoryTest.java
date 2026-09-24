package com.ortos.api.modules.staff;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.junit.jupiter.api.Assertions.*;

class StaffRepositoryTest {
    @Test void mappingsUseRealTableNamesAndStringIdentifiers() throws Exception {
        assertEquals("medicos", Medico.class.getAnnotation(jakarta.persistence.Table.class).name());
        assertEquals("especialidades", Especialidad.class.getAnnotation(jakarta.persistence.Table.class).name());
        assertEquals("usuarios", Usuario.class.getAnnotation(jakarta.persistence.Table.class).name());
        for (Class<?> entity : java.util.List.of(Medico.class, Especialidad.class, Usuario.class)) {
            assertEquals(String.class, entity.getDeclaredField("id").getType());
        }
        assertEquals(java.time.LocalDateTime.class, Usuario.class.getDeclaredField("fechaCreacion").getType());
    }


    @Test void disablingDemoSeedingDoesNotCreateTheStartupRunner() {
        new ApplicationContextRunner().withUserConfiguration(SeedUsersRunner.class)
                .withPropertyValues("ortos.seed.enabled=false")
                .run(context -> assertTrue(context.getBeansOfType(SeedUsersRunner.class).isEmpty()));
    }
}
