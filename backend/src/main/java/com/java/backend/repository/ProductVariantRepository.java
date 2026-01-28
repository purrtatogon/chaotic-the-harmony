package com.java.backend.repository;

import com.java.backend.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findBySku(String sku);
}
