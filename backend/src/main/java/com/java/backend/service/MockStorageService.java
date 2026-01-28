package com.java.backend.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Fallback storage when no Cloudinary API key is configured. Returns fake URLs
 * so the app never crashes for new users or in local/dev without credentials.
 */
@Service
@ConditionalOnMissingBean(StorageService.class)
public class MockStorageService implements StorageService {

    private static final String MOCK_BASE = "https://res.cloudinary.com/mock/image/upload/mock";

    @Override
    public String upload(MultipartFile file, String folder) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) name = "upload";
        String ext = name.contains(".") ? name.substring(name.lastIndexOf('.')) : "";
        String path = (folder != null && !folder.isBlank() ? folder + "/" : "") + UUID.randomUUID() + ext;
        return MOCK_BASE + "/" + path;
    }

    @Override
    public void delete(String publicIdOrUrl) {
        // No-op: nothing to delete in mock mode
    }

    @Override
    public boolean isMock() {
        return true;
    }
}
