package com.java.backend.repository;

import com.java.backend.model.Product;
import com.java.backend.model.ProductVariant;
import com.java.backend.model.ProductInventory;
import com.java.backend.model.enums.ProductType;
import com.java.backend.model.enums.Size;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    /**
     * Optional filters on product + variant + inventory. {@code themeCode} matches
     * that era or {@code THEME-*} collabs; variant joins use {@code distinct(true)}.
     */
    public static Specification<Product> filterProducts(
            Long categoryId,
            ProductType type,
            String themeCode,
            String availability,
            String sizeStr,
            String color
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("productType"), type));
            }

            if (themeCode != null && !themeCode.trim().isEmpty()) {
                String clean = themeCode.trim().toUpperCase();
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.equal(root.get("themeCode"), clean),
                        criteriaBuilder.like(root.get("themeCode"), clean + "-%")
                ));
            }

            Join<Product, ProductVariant> variantJoin = null;

            if (sizeStr != null && !sizeStr.isEmpty()) {
                if (variantJoin == null) variantJoin = root.join("variants");
                Size size = Size.fromString(sizeStr);
                predicates.add(criteriaBuilder.equal(variantJoin.get("size"), size));
            }

            if (availability != null && !availability.isEmpty()) {
                if (variantJoin == null) variantJoin = root.join("variants");
                Join<ProductVariant, ProductInventory> inventoryJoin = variantJoin.join("inventory");

                if ("in_stock".equalsIgnoreCase(availability)) {
                    predicates.add(criteriaBuilder.greaterThan(inventoryJoin.get("stockQuantity"), 0));
                } else if ("out_of_stock".equalsIgnoreCase(availability)) {
                    predicates.add(criteriaBuilder.equal(inventoryJoin.get("stockQuantity"), 0));
                }
            }

            if (color != null && !color.isEmpty()) {
                if (variantJoin == null) variantJoin = root.join("variants");
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(variantJoin.get("variantCode")),
                        "%" + color.toLowerCase() + "%"
                ));
            }

            query.distinct(true);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
