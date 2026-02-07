package com.java.backend;

import com.java.backend.service.CsvSeederService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("local")
class BackendApplicationTests {

    // This replaces the real Seeder with a "dumb" mock that does nothing.
    // This prevents the Seeder from running and crashing the test context.
    @MockitoBean
    private CsvSeederService csvSeederService;

    @Test
    void contextLoads() {
    }

}
