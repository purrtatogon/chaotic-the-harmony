package com.java.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Import this
import com.java.backend.model.enums.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "materials_specs", columnDefinition = "TEXT")
    private String materialsSpecs;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "shipping_info")
    private String shippingInfo;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductImage> images = new HashSet<>();

    // added JsonIgnoreProperties to prevent infinite loop
    @ManyToOne(fetch = FetchType.EAGER) // changed to EAGER for simple JSON serialization in POC
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties("products") // this prevents infinite loop if Category has a list of products
    private Category category;

    @Convert(converter = ProductTypeConverter.class)
    @Column(name = "product_type", nullable = false)
    private ProductType productType;

    @Convert(converter = MusicStyleConverter.class)
    @Column(name = "music_style")
    private MusicStyle musicStyle;

    @Convert(converter = SizeConverter.class)
    @Column(name = "item_size")
    private Size size;

    private String color;


    // GETTERS AND SETTERS

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Set<ProductImage> getImages() { return images; }
    public void setImages(Set<ProductImage> images) { this.images = images; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public ProductType getProductType() { return productType; }
    public void setProductType(ProductType productType) { this.productType = productType; }

    public MusicStyle getMusicStyle() { return musicStyle; }
    public void setMusicStyle(MusicStyle musicStyle) { this.musicStyle = musicStyle; }

    public Size getSize() { return size; }
    public void setSize(Size size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}