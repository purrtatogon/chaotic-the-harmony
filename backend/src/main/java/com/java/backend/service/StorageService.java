package com.java.backend.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction for image/file storage. Controllers depend on this interface
 * so that storage can be either Cloudinary (production) or a mock (no API key).
 */
public interface StorageService {

    /**
     * Upload a file and return the public URL (or a placeholder URL in mock mode).
     *
     * @param file   the file to upload
     * @param folder optional folder/path (e.g. "products")
     * @return the URL to access the stored file
     */
    String upload(MultipartFile file, String folder);

    /**
     * Delete a file by its public ID or URL. No-op in mock mode.
     *
     * @param publicIdOrUrl Cloudinary public ID or full URL
     */
    void delete(String publicIdOrUrl);

    /**
     * Whether this implementation is a real storage backend (e.g. Cloudinary) or a mock.
     */
    boolean isMock();
}
