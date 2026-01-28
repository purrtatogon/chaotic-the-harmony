package com.java.backend.repository;

import com.java.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByCategoryName(String categoryName);
    List<Product> findByNameContainingIgnoreCase(String query);
    
    // Find maximum ID for generating new product IDs
    @Query("SELECT COALESCE(MAX(p.id), 0) FROM Product p")
    Long findMaxId();
    
    // Compatibility for old code
    default List<Product> findByTitleContainingIgnoreCase(String query) {
        return findByNameContainingIgnoreCase(query);
    }
}
