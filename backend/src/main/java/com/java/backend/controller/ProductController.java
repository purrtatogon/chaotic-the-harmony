package com.java.backend.controller;

import com.java.backend.dto.ProductDTO;
import com.java.backend.model.Product;
import com.java.backend.model.ProductImage;
import com.java.backend.model.Category;
import com.java.backend.model.enums.ProductType;
import com.java.backend.repository.ProductRepository;
import com.java.backend.repository.CategoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.java.backend.repository.ProductSpecification;
import com.java.backend.model.enums.ProductType;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductController(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Product> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, name = "productType") String typeCode,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String color,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        // manually convert the code (e.g., "TSH") to the enum (ProductType.Tee)
        ProductType type = null;
        if (typeCode != null && !typeCode.isEmpty()) {
            try {
                type = ProductType.fromString(typeCode);
            } catch (IllegalArgumentException e) {
                System.out.println("Invalid Product Type Code: " + typeCode);
            }
        }

        // pass the resolved enum to specification
        Specification<Product> spec = ProductSpecification.filterProducts(categoryId, type, availability, size, color);

        return productRepository.findAll(spec, Sort.by(direction, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam("q") String query) {
        return productRepository.findByTitleContainingIgnoreCase(query);
    }

    @GetMapping("/types")
    public List<Map<String, String>> getProductTypes() {
        return Arrays.stream(ProductType.values())
                .map(type -> Map.of(
                        "name", type.name(),      // Display Label: "Tee", "Vinyl"
                        "code", type.getCode()    // Value: "TSH", "VNL"
                ))
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody ProductDTO dto) {
        Product product = new Product();
        mapDtoToEntity(dto, product);

        // Fetch and set Category
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);

        // Convert String URLs to ProductImage entities
        if (dto.getImageUrls() != null) {
            List<ProductImage> productImages = new ArrayList<>();
            for (int i = 0; i < dto.getImageUrls().size(); i++) {
                productImages.add(new ProductImage(dto.getImageUrls().get(i), i, product));
            }
            product.setImages(productImages);
        }

        return ResponseEntity.ok(productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody ProductDTO dto) {
        return productRepository.findById(id).map(existingProduct -> {
            mapDtoToEntity(dto, existingProduct);

            // Update Category if changed
            if (dto.getCategoryId() != null) {
                Category category = categoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found"));
                existingProduct.setCategory(category);
            }

            // IMAGE GALLERY UPDATE
            if (dto.getImageUrls() != null) {
                // orphanRemoval = true in Product.java will handle the DB cleanup
                existingProduct.getImages().clear();

                for (int i = 0; i < dto.getImageUrls().size(); i++) {
                    ProductImage newImg = new ProductImage(dto.getImageUrls().get(i), i, existingProduct);
                    existingProduct.getImages().add(newImg);
                }
            }

            return ResponseEntity.ok(productRepository.save(existingProduct));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Helper method to keep code clean
    private void mapDtoToEntity(ProductDTO dto, Product product) {
        product.setSku(dto.getSku());
        product.setTitle(dto.getTitle());
        product.setDescription(dto.getDescription());
        product.setMaterialsSpecs(dto.getMaterialsSpecs());
        product.setPrice(dto.getPrice());
        product.setShippingInfo(dto.getShippingInfo());
        product.setStockQuantity(dto.getStockQuantity());
        product.setProductType(dto.getProductType());
        product.setMusicStyle(dto.getMusicStyle());
        product.setItemSize(dto.getItemSize());
        product.setColor(dto.getColor());
    }
}