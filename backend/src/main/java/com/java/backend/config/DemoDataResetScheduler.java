package com.java.backend.config;

import com.java.backend.service.SeederService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Aligns with the storefront {@code DemoBanner} countdown: full data restore at 00:00, 08:00, and 16:00 UTC.
 */
@Component
@Profile("demo")
public class DemoDataResetScheduler {

    private static final Logger logger = LoggerFactory.getLogger(DemoDataResetScheduler.class);

    private final SeederService seederService;

    @Value("${demo.scheduled-reset.enabled:true}")
    private boolean scheduledResetEnabled;

    public DemoDataResetScheduler(SeederService seederService) {
        this.seederService = seederService;
    }

    @Scheduled(cron = "0 0 0,8,16 * * *", zone = "UTC")
    public void resetDemoDataOnSchedule() {
        if (!scheduledResetEnabled) {
            return;
        }
        logger.info("Scheduled demo data reset (UTC 8-hour boundary) starting...");
        try {
            seederService.reseedDemoData();
            logger.info("Scheduled demo data reset finished.");
        } catch (Exception e) {
            logger.error("Scheduled demo data reset failed", e);
        }
    }
}
