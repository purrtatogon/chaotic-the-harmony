package com.java.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
public class Category extends BaseEntity {

    // Removed @Id private Long id; (Inherited)

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Product> products = new HashSet<>();

    public Category() {}

    public Category(Long id, String name, String code, String description) {
        this.setId(id); // Use the setter from BaseEntity
        this.name = name;
        this.code = code;
        this.description = description;
    }

    // --- GETTERS AND SETTERS ---
    // (getId and setId are inherited from BaseEntity)

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Set<Product> getProducts() { return products; }
    public void setProducts(Set<Product> products) { this.products = products; }
}