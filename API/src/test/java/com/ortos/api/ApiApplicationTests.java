package com.ortos.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires a configured PostgreSQL instance; Compose verifies the Flyway/JPA startup path.")
class ApiApplicationTests {
    @Test
    void contextLoads() {
    }
}

