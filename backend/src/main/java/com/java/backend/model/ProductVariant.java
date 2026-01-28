package com.java.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.java.backend.model.enums.Size;
import com.java.backend.model.enums.SizeConverter;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "product_variants")
public class ProductVariant extends BaseEntity {

    // Removed @Id private Long id; (Inherited from BaseEntity)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties("variants")
    private Product product;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(name = "variant_code")
    private String variantCode;

    @Convert(converter = SizeConverter.class)
    @Column(name = "size_code")
    private Size size;

    @OneToOne(mappedBy = "productVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("productVariant")
    @JsonManagedReference
    private ProductInventory inventory;

    @OneToMany(mappedBy = "productVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Set<ProductPrice> prices = new HashSet<>();

    @OneToMany(mappedBy = "productVariant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("productVariant")
    @OrderBy("displayOrder ASC")
    private Set<ProductImage> images = new HashSet<>();

    // --- GETTERS AND SETTERS ---
    // (getId and setId are inherited from BaseEntity)

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getVariantCode() { return variantCode; }
    public void setVariantCode(String variantCode) { this.variantCode = variantCode; }

    public Size getSize() { return size; }
    public void setSize(Size size) { this.size = size; }

    public ProductInventory getInventory() { return inventory; }
    public void setInventory(ProductInventory inventory) { this.inventory = inventory; }

    public Set<ProductPrice> getPrices() { return prices; }
    public void setPrices(Set<ProductPrice> prices) { this.prices = prices; }

    public Set<ProductImage> getImages() { return images; }
    public void setImages(Set<ProductImage> images) { this.images = images; }

    // Convenience methods for stock (used by Specification and Controller)
    public Integer getStockQuantity() {
        return (inventory != null) ? inventory.getStockQuantity() : 0;
    }
}