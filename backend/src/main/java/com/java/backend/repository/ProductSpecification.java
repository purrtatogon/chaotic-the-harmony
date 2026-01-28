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

    public static Specification<Product> filterProducts(
            Long categoryId,
            ProductType type,
            String availability,
            String sizeStr,
            String color
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by Category
            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            // Filter by Product Type (CD, Vinyl, Tee, etc)
            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("productType"), type));
            }

            // Joins for Variant-based filtering
            Join<Product, ProductVariant> variantJoin = null;

            // Filter by Size
            if (sizeStr != null && !sizeStr.isEmpty()) {
                if (variantJoin == null) variantJoin = root.join("variants");
                Size size = Size.fromString(sizeStr);
                predicates.add(criteriaBuilder.equal(variantJoin.get("size"), size));
            }

            // Filter by Availability (requires join to Inventory)
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
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("designCode")), "%" + color.toLowerCase() + "%"));
            }

            // Ensure distinct results because of the joins
            query.distinct(true);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
