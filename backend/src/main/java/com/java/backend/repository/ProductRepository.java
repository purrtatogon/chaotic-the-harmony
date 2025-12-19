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

    // Find all Products belonging to a specific Category
    List<Product> findByCategoryName(String categoryName);
}
