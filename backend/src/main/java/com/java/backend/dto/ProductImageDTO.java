package com.java.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProductImageDTO {
    private String imageUrl;
    private String altText;
    private Long id;

    public ProductImageDTO() {}

    public ProductImageDTO(String imageUrl, String altText) {
        this.imageUrl = imageUrl;
        this.altText = altText;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAltText() {
        return altText;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
