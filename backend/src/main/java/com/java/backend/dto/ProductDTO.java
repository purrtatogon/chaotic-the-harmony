package com.java.backend.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.java.backend.model.enums.*;
import java.util.List;
import java.util.Map;

public class ProductDTO {
    private String name;
    private String description;
    private String materialsSpecs;
    private String shippingInfo;
    private Long categoryId;
    private ProductType productType;
    private String themeCode;
    private String designCode;
    private List<String> imageUrls; // For backward compatibility
    private List<Map<String, Object>> images; // New format with alt text

    // GETTERS AND SETTERS
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMaterialsSpecs() { return materialsSpecs; }
    public void setMaterialsSpecs(String materialsSpecs) { this.materialsSpecs = materialsSpecs; }

    public String getShippingInfo() { return shippingInfo; }
    public void setShippingInfo(String shippingInfo) { this.shippingInfo = shippingInfo; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public ProductType getProductType() { return productType; }
    
    @JsonProperty("productType")
    public void setProductType(Object productType) {
        if (productType == null) {
            this.productType = null;
        } else if (productType instanceof ProductType) {
            this.productType = (ProductType) productType;
        } else {
            // Convert string code to ProductType using @JsonCreator method
            this.productType = ProductType.fromString(productType.toString());
        }
    }

    public String getThemeCode() { return themeCode; }
    public void setThemeCode(String themeCode) { this.themeCode = themeCode; }

    public String getDesignCode() { return designCode; }
    public void setDesignCode(String designCode) { this.designCode = designCode; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public List<Map<String, Object>> getImages() { return images; }
    public void setImages(List<Map<String, Object>> images) { this.images = images; }
    
    // Compatibility for old code
    public String getTitle() { return name; }
    public void setTitle(String title) { this.name = title; }
}
