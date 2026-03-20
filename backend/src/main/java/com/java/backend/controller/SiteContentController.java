package com.java.backend.controller;

import com.java.backend.dto.SiteContentBlockResponse;
import com.java.backend.repository.SiteContentRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/site-content")
public class SiteContentController {

    private final SiteContentRepository siteContentRepository;

    public SiteContentController(SiteContentRepository siteContentRepository) {
        this.siteContentRepository = siteContentRepository;
    }

    @GetMapping
    public List<SiteContentBlockResponse> getAll() {
        return siteContentRepository.findAllByOrderBySectionAscEntryKeyAsc().stream()
                .map(e -> new SiteContentBlockResponse(
                        e.getSection(),
                        e.getEntryKey(),
                        e.getTitle(),
                        e.getContent()
                ))
                .toList();
    }
}
