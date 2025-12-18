package com.java.backend.model;

import jakarta.persistence.*;
/* Maps the primary key auto-generation strategy to PostgreSQL's SERIAL/BIGSERIAL type.
 * This is essential for preventing schema validation errors when using ddl-auto=validate
 * and ensuring new records get an auto-generated ID from the database.
 */
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "category")

public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
    private String code; // Stores "MUS", "APL" or "ACC"
    private String description; // do i need this?


    // one category can have many products
    // 'mappedBy' tells JPA that the 'category' field in the Product entity owns the foreign key.
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Product> products = new HashSet<>();


    public Category() {
    }

    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }
}