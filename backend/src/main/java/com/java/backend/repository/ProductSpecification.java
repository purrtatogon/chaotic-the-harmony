package com.java.backend.repository;

import com.java.backend.model.Product;
import com.java.backend.model.Category;
import com.java.backend.model.enums.ProductType;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterProducts(
            Long categoryId,
            ProductType type,
            String availability,
            String size,
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

            // Filter by Size (Exact match)
            if (size != null && !size.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("itemSize"), size));
            }

            // Filter by Color (Case insensitive search)
            if (color != null && !color.isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("color")), "%" + color.toLowerCase() + "%"));
            }

            // Filter by Availability
            if ("in_stock".equalsIgnoreCase(availability)) {
                predicates.add(criteriaBuilder.greaterThan(root.get("stockQuantity"), 0));
            } else if ("out_of_stock".equalsIgnoreCase(availability)) {
                predicates.add(criteriaBuilder.equal(root.get("stockQuantity"), 0));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}