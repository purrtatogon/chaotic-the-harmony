package com.java.backend.model;

import com.java.backend.model.enums.MusicStyle;
import com.java.backend.model.enums.ProductType;
import com.java.backend.model.enums.Size;
import jakarta.persistence.*;
/* Maps the primary key auto-generation strategy to PostgreSQL's SERIAL/BIGSERIAL type.
 * This is essential for preventing schema validation errors when using ddl-auto=validate
 * and ensuring new records get an auto-generated ID from the database.
 */
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import java.math.BigDecimal;

@Entity
@Table(name = "product")

public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Common attributes
    @Column(nullable = false, unique = true)
    private String sku; // like "MUS-CD-STD-0001"

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    public Category category;


    // Specific attributes (nullable)
    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType productType; // CD, VINYL, TEE, etc

    @Enumerated(EnumType.STRING)
    @Column(name = "music_style")
    private MusicStyle musicStyle; // STD, DLX or CLR (null for apparel)

    @Enumerated(EnumType.STRING)
    @Column(name = "item_size")
    private Size size; // M, L, XL... (null for music)

    private String color; // "Black", "Blue" (null for music)
}