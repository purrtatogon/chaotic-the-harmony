package com.java.backend.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/** Fake URLs when Cloudinary is not configured. */
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
    }

    @Override
    public boolean isMock() {
        return true;
    }
}
