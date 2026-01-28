package com.java.backend.repository;

import com.java.backend.model.ProductInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductInventoryRepository extends JpaRepository<ProductInventory, Long> {
    long countByStockQuantityLessThan(int threshold);
    long countByStockQuantity(int stock);
}
