package com.java.backend.controller;

import com.java.backend.dto.SiteContentBlockResponse;
import com.java.backend.dto.SiteContentUpdateRequest;
import com.java.backend.model.SiteContentEntry;
import com.java.backend.model.User;
import com.java.backend.repository.SiteContentRepository;
import com.java.backend.repository.UserRepository;
import com.java.backend.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Public read of CMS blocks + admin update for copy (home/store/about, etc.). */
@RestController
@RequestMapping("/api/v1/site-content")
public class SiteContentController {

    private final SiteContentRepository siteContentRepository;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public SiteContentController(SiteContentRepository siteContentRepository,
                                 AuditLogService auditLogService,
                                 UserRepository userRepository) {
        this.siteContentRepository = siteContentRepository;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<SiteContentBlockResponse> getAll() {
        return siteContentRepository.findAllByOrderBySectionAscEntryKeyAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteContentBlockResponse> getById(@PathVariable Long id) {
        return siteContentRepository.findById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteContentBlockResponse> update(
            @PathVariable Long id,
            @RequestBody SiteContentUpdateRequest request) {
        return siteContentRepository.findById(id)
                .map(entry -> {
                    if (request.getTitle() != null) {
                        entry.setTitle(request.getTitle());
                    }
                    if (request.getContent() != null) {
                        entry.setContent(request.getContent());
                    }
                    SiteContentEntry saved = siteContentRepository.save(entry);
                    String email = SecurityContextHolder.getContext().getAuthentication().getName();
                    User actor = userRepository.findByEmail(email).orElse(null);
                    auditLogService.log("CONTENT_UPDATED",
                            "Updated content: " + saved.getSection() + " / " + saved.getEntryKey(),
                            "CONTENT", saved.getId(), actor);
                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private SiteContentBlockResponse toResponse(SiteContentEntry e) {
        return new SiteContentBlockResponse(
                e.getId(),
                e.getSection(),
                e.getEntryKey(),
                e.getTitle(),
                e.getContent()
        );
    }
}
