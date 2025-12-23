package com.java.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "product_image")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Stores the Cloudinary URL
    @Column(nullable = false)
    private String imageUrl;

    // used to control which image appears first (like in a gallery)
    private Integer displayOrder;

    // one product can have many images
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    // CONSTRUCTORS
    public ProductImage() {}

    public ProductImage(String imageUrl, Integer displayOrder, Product product) {
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
        this.product = product;
    }

    // GETTERS and SETTERS
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Product getProduct() {
        return product;
    }
    public void setProduct(Product product) {
        this.product = product;
    }

}
