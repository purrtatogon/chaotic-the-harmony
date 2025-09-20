package com.java.backend.controller;

import com.java.backend.dto.ProductDTO;
import com.java.backend.model.Category;
import com.java.backend.model.Product;
import com.java.backend.model.ProductImage;
import com.java.backend.model.ProductInventory;
import com.java.backend.model.ProductVariant;
import com.java.backend.model.User;
import com.java.backend.model.enums.ProductType;
import com.java.backend.repository.CategoryRepository;
import com.java.backend.repository.ProductImageRepository;
import com.java.backend.repository.ProductInventoryRepository;
import com.java.backend.repository.ProductRepository;
import com.java.backend.repository.ProductSpecification;
import com.java.backend.repository.ProductVariantRepository;
import com.java.backend.repository.UserRepository;
import com.java.backend.service.AuditLogService;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/** Storefront catalogue + stock endpoints; mutations write audit logs. */
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductInventoryRepository productInventoryRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public ProductController(ProductRepository productRepository,
                             CategoryRepository categoryRepository,
                             ProductImageRepository productImageRepository,
                             ProductVariantRepository productVariantRepository,
                             ProductInventoryRepository productInventoryRepository,
                             UserRepository userRepository,
                             AuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<Product> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, name = "productType") String typeCode,
            @RequestParam(required = false) String themeCode,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String color,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        ProductType type = null;
        if (typeCode != null && !typeCode.isEmpty()) {
            type = ProductType.fromString(typeCode);
        }
        // Unknown type codes -> null spec filter (ignore), not an error.

        String effectiveSortBy = sortBy;
        if ("price".equalsIgnoreCase(sortBy) || "stockQuantity".equalsIgnoreCase(sortBy)) {
            effectiveSortBy = "id"; // sorts live on variant/inventory joins now
        }

        Specification<Product> spec = ProductSpecification.filterProducts(
                categoryId, type, themeCode, availability, size, color);

        return productRepository.findAll(spec, Sort.by(direction, effectiveSortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam("q") String query) {
        return productRepository.findByNameContainingIgnoreCase(query);
    }

    @GetMapping("/types")
    public List<Map<String, String>> getProductTypes() {
        // Only show types actually present — keeps the storefront filter dropdown honest vs hard-coded enums.
        return productRepository.findAll().stream()
                .map(Product::getProductType)
                .distinct()
                .filter(type -> type != null)
                .map(type -> Map.of(
                        "name", type.name(),
                        "code", type.getCode()
                ))
                .sorted((a, b) -> {
                    // Manual order so CDs/vinyl bubble up ahead of miscellaneous merch SKUs.
                    String nameA = a.get("name");
                    String nameB = b.get("name");
                    int orderA = getTypeOrder(nameA);
                    int orderB = getTypeOrder(nameB);
                    return Integer.compare(orderA, orderB);
                })
                .collect(Collectors.toList());
    }
    
    private int getTypeOrder(String typeName) {
        switch (typeName) {
            case "CD": return 1;
            case "Vinyl": return 2;
            case "Tee": return 3;
            case "Sweater": return 4;
            case "Hoodie": return 5;
            case "Beanie": return 6;
            case "Blanket": return 7;
            case "Tote": return 8;
            case "Rug": return 9;
            case "Coaster": return 10;
            case "Mug": return 11;
            case "Pillow": return 12;
            case "Keychain": return 13;
            case "Magnet": return 14;
            case "Sticker": return 15;
            case "Poster": return 16;
            default: return 99;
        }
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody ProductDTO dto) {
        Product product = new Product();

        // IDs are assigned explicitly in CSV; new admin-created rows continue that sequence via DB max()+1.
        Long maxId = productRepository.findMaxId();
        product.setId(maxId + 1);
        
        mapDtoToEntity(dto, product);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);

        Product saved = productRepository.save(product);
        auditLogService.log("PRODUCT_CREATED",
                "Created product: " + saved.getName(),
                "PRODUCT", saved.getId(), resolveCurrentUser());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody ProductDTO dto) {
        return productRepository.findById(id).map(existingProduct -> {
            mapDtoToEntity(dto, existingProduct);

            if (dto.getCategoryId() != null) {
                Category category = categoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found"));
                existingProduct.setCategory(category);
            }

            // Handle image updates if images or imageUrls are provided
            if (dto.getImages() != null && !dto.getImages().isEmpty()) {
                updateProductImages(existingProduct, dto.getImages());
            } else if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
                // Backward compatibility: convert imageUrls to images format
                updateProductImagesFromUrls(existingProduct, dto.getImageUrls());
            }

            Product updated = productRepository.save(existingProduct);
            auditLogService.log("PRODUCT_UPDATED",
                    "Updated product: " + updated.getName(),
                    "PRODUCT", id, resolveCurrentUser());
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            String name = productRepository.findById(id).map(Product::getName).orElse("Unknown");
            productRepository.deleteById(id);
            auditLogService.log("PRODUCT_DELETED",
                    "Deleted product: " + name,
                    "PRODUCT", id, resolveCurrentUser());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private void mapDtoToEntity(ProductDTO dto, Product product) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setMaterialsSpecs(dto.getMaterialsSpecs());
        product.setShippingInfo(dto.getShippingInfo());
        
        ProductType productType = dto.getProductType();
        if (productType == null && product.getId() == null) {
            throw new IllegalArgumentException("ProductType is required");
        }
        if (productType != null) {
            product.setProductType(productType);
        }
        
        product.setThemeCode(dto.getThemeCode());
        product.setDesignCode(dto.getDesignCode());
    }

    private void updateProductImages(Product product, List<Map<String, Object>> images) {
        // Clear existing images for this product
        Set<ProductImage> existingImages = new HashSet<>(product.getImages());
        for (ProductImage image : existingImages) {
            if (image.getProduct() != null && image.getProduct().getId().equals(product.getId())) {
                productImageRepository.delete(image);
            }
        }
        product.getImages().clear();

        // Add new images
        Set<ProductImage> newImages = new HashSet<>();
        for (int i = 0; i < images.size(); i++) {
            Map<String, Object> imgData = images.get(i);
            String imageUrl = null;
            String altText = null;
            
            // Handle both object format {imageUrl: "...", altText: "..."} and string format
            if (imgData.get("imageUrl") != null) {
                imageUrl = imgData.get("imageUrl").toString();
            } else if (imgData.get("url") != null) {
                imageUrl = imgData.get("url").toString();
            }
            
            if (imgData.get("altText") != null) {
                altText = imgData.get("altText").toString();
            }
            
            if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImageUrl(imageUrl);
                image.setDisplayOrder(i + 1);
                image.setAltText(altText != null && !altText.trim().isEmpty() 
                    ? altText 
                    : product.getName() + " - Image " + (i + 1));
                newImages.add(image);
            }
        }
        product.setImages(newImages);
    }

    private void updateProductImagesFromUrls(Product product, List<String> imageUrls) {
        // Clear existing images for this product
        Set<ProductImage> existingImages = new HashSet<>(product.getImages());
        for (ProductImage image : existingImages) {
            if (image.getProduct() != null && image.getProduct().getId().equals(product.getId())) {
                productImageRepository.delete(image);
            }
        }
        product.getImages().clear();

        // Add new images
        Set<ProductImage> newImages = new HashSet<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            String imageUrl = imageUrls.get(i);
            if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImageUrl(imageUrl);
                image.setDisplayOrder(i + 1);
                image.setAltText(product.getName() + " - Image " + (i + 1));
                newImages.add(image);
            }
        }
        product.setImages(newImages);
    }

    @PatchMapping("/variants/{variantId}/stock")
    public ResponseEntity<?> updateVariantStock(
            @PathVariable Long variantId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails principal) {

        ProductVariant variant = productVariantRepository.findById(variantId).orElse(null);
        if (variant == null) {
            return ResponseEntity.notFound().build();
        }

        ProductInventory inventory = variant.getInventory();
        if (inventory == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No inventory record for this variant."));
        }

        if (body.containsKey("stockQuantity")) {
            int qty;
            try {
                qty = Integer.parseInt(body.get("stockQuantity").toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "stockQuantity must be a number."));
            }
            if (qty < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "stockQuantity cannot be negative."));
            }
            inventory.setStockQuantity(qty);
        }

        if (body.containsKey("stockLocation")) {
            inventory.setStockLocation(body.get("stockLocation").toString().trim());
        }

        inventory.setStockUpdatedAt(LocalDateTime.now());

        User staffUser = userRepository.findByEmail(principal.getUsername()).orElse(null);
        if (staffUser != null) {
            inventory.setUpdatedBy(staffUser);
        }

        productInventoryRepository.save(inventory);

        auditLogService.log("STOCK_UPDATED",
                "Updated stock on " + variant.getSku() + " to " + inventory.getStockQuantity(),
                "PRODUCT", variant.getProduct().getId(), staffUser);

        Product product = variant.getProduct();
        return ResponseEntity.ok(productRepository.findById(product.getId()).orElse(product));
    }

    private User resolveCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}
