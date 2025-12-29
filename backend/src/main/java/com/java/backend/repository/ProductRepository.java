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

    List<Product> findByTitleContainingIgnoreCase(String title);

    List<Product> findByCategoryName(String categoryName);
}