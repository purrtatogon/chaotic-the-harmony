package com.java.backend.repository;

import com.java.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    List<Product> findByCategoryId(Long categoryId);

    Optional<Product> findBySku(String sku);

    List<Product> findByTitleContainingIgnoreCase(String query);

    // NEW: Count products with low stock (e.g., less than 10)
    long countByStockQuantityLessThan(int threshold);

    // NEW: Count products that are completely out of stock
    long countByStockQuantity(int stock);

    List<Product> findByCategoryName(String categoryName);
}