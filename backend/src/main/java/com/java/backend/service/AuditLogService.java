package com.java.backend.service;

import com.java.backend.model.AuditLog;
import com.java.backend.model.User;
import com.java.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/** Simple append-only log for dashboard + accountability (who changed what). */
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String description,
                    String entityType, Long entityId, User performedBy) {
        AuditLog entry = new AuditLog(
                action, description, entityType, entityId,
                performedBy, LocalDateTime.now()
        );
        auditLogRepository.save(entry);
    }
}
