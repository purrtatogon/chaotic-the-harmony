package com.java.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products_inventory")
public class ProductInventory extends BaseEntity {

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    @JsonIgnoreProperties("inventory")
    @JsonBackReference
    private ProductVariant productVariant;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "stock_location")
    private String stockLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User updatedBy;

    @Column(name = "stock_updated_at")
    private LocalDateTime stockUpdatedAt;

    // --- GETTERS AND SETTERS ---

    public ProductVariant getProductVariant() { return productVariant; }
    public void setProductVariant(ProductVariant productVariant) { this.productVariant = productVariant; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getStockLocation() { return stockLocation; }
    public void setStockLocation(String stockLocation) { this.stockLocation = stockLocation; }

    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getStockUpdatedAt() { return stockUpdatedAt; }
    public void setStockUpdatedAt(LocalDateTime stockUpdatedAt) { this.stockUpdatedAt = stockUpdatedAt; }
}
