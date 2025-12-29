package com.java.backend.dto;

import com.java.backend.model.enums.*;
import java.math.BigDecimal;
import java.util.List;

public class ProductDTO {
    private String sku;
    private String title;
    private String description;
    private String materialsSpecs;
    private BigDecimal price;
    private String shippingInfo;
    private Integer stockQuantity;
    private Long categoryId;
    private List<String> imageUrls;
    private ProductType productType;
    private MusicStyle musicStyle;
    private Size itemSize;
    private String color;

    // GETTERS AND SETTERS
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMaterialsSpecs() { return materialsSpecs; }
    public void setMaterialsSpecs(String materialsSpecs) { this.materialsSpecs = materialsSpecs; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getShippingInfo() { return shippingInfo; }
    public void setShippingInfo(String shippingInfo) { this.shippingInfo = shippingInfo; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public ProductType getProductType() { return productType; }
    public void setProductType(ProductType productType) { this.productType = productType; }

    public MusicStyle getMusicStyle() { return musicStyle; }
    public void setMusicStyle(MusicStyle musicStyle) { this.musicStyle = musicStyle; }

    public Size getItemSize() { return itemSize; }
    public void setItemSize(Size itemSize) { this.itemSize = itemSize; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}