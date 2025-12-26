package com.java.backend.repository;

import com.java.backend.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    // Find all images for a specific product, ordered by their display order
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);
}