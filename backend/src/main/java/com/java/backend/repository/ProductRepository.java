package com.java.backend.repository;

import com.java.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find a Product by its unique SKU
    Optional<Product> findBySku(String sku);

    // Find all Products by title (case insensitive search)
    List<Product> findByTitleContainingIgnoreCase(String title);

    // Find by Category Object's Name (search bars)
    List<Product> findByCategoryName(String categoryName);

    // Find by Category ID (frontend dropdowns/filters)
    List<Product> findByCategoryId(Long categoryId);
}