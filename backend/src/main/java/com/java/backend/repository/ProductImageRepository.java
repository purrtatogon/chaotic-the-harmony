package com.java.backend.repository;

import com.java.backend.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);
    List<ProductImage> findByProductVariantIdOrderByDisplayOrderAsc(Long variantId);
}
