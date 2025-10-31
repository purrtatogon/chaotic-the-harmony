package com.java.backend.repository;

import com.java.backend.model.ProductPrice;
import com.java.backend.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductPriceRepository extends JpaRepository<ProductPrice, Long> {
    Optional<ProductPrice> findByProductVariantAndCurrencyCode(ProductVariant variant, String currencyCode);
    
    // For compatibility with OrderSeeder
    default Optional<ProductPrice> findByVariantAndCurrency(ProductVariant variant, String currency) {
        return findByProductVariantAndCurrencyCode(variant, currency);
    }
}
