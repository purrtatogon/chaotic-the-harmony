package com.java.backend.config;

import com.java.backend.service.CsvSeederService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Self-healing task: resets the database to initial seeded state every 20 minutes.
 * Only active when the "prod" profile is enabled (e.g. on Render).
 */
@Component
@Profile("prod")
public class DatabaseCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseCleanupTask.class);

    private final JdbcTemplate jdbcTemplate;
    private final CsvSeederService csvSeederService;

    public DatabaseCleanupTask(JdbcTemplate jdbcTemplate, CsvSeederService csvSeederService) {
        this.jdbcTemplate = jdbcTemplate;
        this.csvSeederService = csvSeederService;
    }

    @Scheduled(cron = "0 */20 * * * *")
    public void selfHeal() {
        logger.info("♻️ SELF-HEALING: Resetting database to initial state...");
        try {
            truncateAllTables();
            csvSeederService.runSeed();
            logger.info("♻️ SELF-HEALING: Database reset and re-seeded successfully.");
        } catch (Exception e) {
            logger.error("♻️ SELF-HEALING: Reset failed", e);
        }
    }

    private void truncateAllTables() {
        // Order: child tables first, then parents. RESTART IDENTITY resets sequences.
        jdbcTemplate.execute("TRUNCATE TABLE order_items, orders, products_inventory, product_prices, " +
                "product_variants, product_images, products, categories, app_users RESTART IDENTITY CASCADE");
    }
}
