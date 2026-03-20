package com.java.backend.service;

import org.springframework.web.multipart.MultipartFile;

/** Image storage: Cloudinary in prod or mock when no API key. */
public interface StorageService {

    String upload(MultipartFile file, String folder);

    void delete(String publicIdOrUrl);

    boolean isMock();
}
