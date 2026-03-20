package com.java.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/** Cloudinary uploads when {@code cloudinary.api-key} is set; otherwise the mock bean is used. */
@Service
@ConditionalOnProperty(prefix = "cloudinary", name = "api-key")
public class CloudinaryStorageService implements StorageService {

    private final Cloudinary cloudinary;

    public CloudinaryStorageService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {
        if (cloudName == null || cloudName.isBlank() || apiKey == null || apiKey.isBlank() || apiSecret == null || apiSecret.isBlank()) {
            throw new IllegalStateException(
                "Cloudinary credentials incomplete. Set cloudinary.cloud-name, api-key, and api-secret, or remove api-key to use Mock Mode.");
        }
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    @Override
    @SuppressWarnings("unchecked")
    public String upload(MultipartFile file, String folder) {
        try {
            Map<String, Object> options = ObjectUtils.emptyMap();
            if (folder != null && !folder.isBlank()) {
                options = ObjectUtils.asMap("folder", folder);
            }
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), options);
            Object url = result.get("secure_url");
            return url != null ? url.toString() : "";
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed", e);
        }
    }

    @Override
    public void delete(String publicIdOrUrl) {
        try {
            String publicId = extractPublicId(publicIdOrUrl);
            if (publicId != null && !publicId.isBlank()) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            System.err.println("Cloudinary delete failed for " + publicIdOrUrl + ": " + e.getMessage());
        }
    }

    @Override
    public boolean isMock() {
        return false;
    }

    private static String extractPublicId(String publicIdOrUrl) {
        if (publicIdOrUrl == null || publicIdOrUrl.isBlank()) return null;
        if (publicIdOrUrl.contains("res.cloudinary.com")) {
            int upload = publicIdOrUrl.indexOf("/upload/");
            if (upload >= 0) {
                String after = publicIdOrUrl.substring(upload + "/upload/".length());
                int v = after.indexOf('/');
                if (v >= 0) after = after.substring(v + 1);
                return after.replaceFirst("\\.([^.]+)$", "");
            }
        }
        return publicIdOrUrl;
    }
}
