package com.java.backend.config;

import com.java.backend.service.CsvSeederService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Truncate main tables and re-run CSV seed. {@code prod} profile only; add {@code @Scheduled} if you want it on a timer.
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
        jdbcTemplate.execute("TRUNCATE TABLE order_items, orders, products_inventory, product_prices, " +
                "product_variants, product_images, products, categories, app_users, site_content_entries " +
                "RESTART IDENTITY CASCADE");
    }
}
