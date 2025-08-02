package com.java.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.java.backend.model.enums.*;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    // Removed @Id private Long id; (Inherited from BaseEntity)

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "materials_specs", columnDefinition = "TEXT")
    private String materialsSpecs;

    @Column(name = "shipping_info", columnDefinition = "TEXT")
    private String shippingInfo;

    @Column(name = "theme_code")
    private String themeCode;

    @Column(name = "design_code")
    private String designCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties("products")
    private Category category;

    @Convert(converter = ProductTypeConverter.class)
    @Column(name = "product_type", nullable = false)
    private ProductType productType;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("product")
    private Set<ProductVariant> variants = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("product")
    @OrderBy("displayOrder ASC")
    private Set<ProductImage> images = new HashSet<>();

    // --- GETTERS AND SETTERS ---
    // (getId and setId are inherited from BaseEntity)

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMaterialsSpecs() { return materialsSpecs; }
    public void setMaterialsSpecs(String materialsSpecs) { this.materialsSpecs = materialsSpecs; }

    public String getShippingInfo() { return shippingInfo; }
    public void setShippingInfo(String shippingInfo) { this.shippingInfo = shippingInfo; }

    public String getThemeCode() { return themeCode; }
    public void setThemeCode(String themeCode) { this.themeCode = themeCode; }

    public String getDesignCode() { return designCode; }
    public void setDesignCode(String designCode) { this.designCode = designCode; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public ProductType getProductType() { return productType; }
    public void setProductType(ProductType productType) { this.productType = productType; }

    public Set<ProductVariant> getVariants() { return variants; }
    public void setVariants(Set<ProductVariant> variants) { this.variants = variants; }

    public Set<ProductImage> getImages() { return images; }
    public void setImages(Set<ProductImage> images) { this.images = images; }
}