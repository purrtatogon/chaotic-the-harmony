package com.java.backend.controller;

import com.java.backend.model.Category;
import com.java.backend.model.Product;
import com.java.backend.model.User;
import com.java.backend.repository.CategoryRepository;
import com.java.backend.repository.ProductRepository;
import com.java.backend.repository.UserRepository;
import com.java.backend.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Category CRUD plus products-in-category lookup. */
@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public CategoryController(CategoryRepository categoryRepository, ProductRepository productRepository,
                              AuditLogService auditLogService, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long id) {
        List<Product> products = productRepository.findByCategoryId(id);
        return ResponseEntity.ok(products);
    }


    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        Category saved = categoryRepository.save(category);
        auditLogService.log("CATEGORY_CREATED",
                "Created category: " + saved.getName(),
                "CATEGORY", saved.getId(), resolveCurrentUser());
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        return categoryRepository.findById(id).map(category -> {
            category.setName(categoryDetails.getName());
            category.setDescription(categoryDetails.getDescription());
            Category updated = categoryRepository.save(category);
            auditLogService.log("CATEGORY_UPDATED",
                    "Updated category: " + updated.getName(),
                    "CATEGORY", id, resolveCurrentUser());
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        if (categoryRepository.existsById(id)) {
            String name = categoryRepository.findById(id).map(Category::getName).orElse("Unknown");
            categoryRepository.deleteById(id);
            auditLogService.log("CATEGORY_DELETED",
                    "Deleted category: " + name,
                    "CATEGORY", id, resolveCurrentUser());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private User resolveCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}