package com.java.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "products_inventory")
public class ProductInventory extends BaseEntity {

    // Removed @Id private Long id; (Inherited from BaseEntity)

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    @JsonIgnoreProperties("inventory")
    @JsonBackReference
    private ProductVariant productVariant;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "stock_location")
    private String stockLocation;

    // --- GETTERS AND SETTERS ---
    // (getId and setId are inherited from BaseEntity)

    public ProductVariant getProductVariant() { return productVariant; }
    public void setProductVariant(ProductVariant productVariant) { this.productVariant = productVariant; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getStockLocation() { return stockLocation; }
    public void setStockLocation(String stockLocation) { this.stockLocation = stockLocation; }
}