package com.java.backend.controller;

import com.java.backend.model.Product;
import com.java.backend.model.ProductImage;
import com.java.backend.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
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

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        // RELATIONSHIP LINKING
        // Link images to the product so product_id is saved correctly
        if (product.getImages() != null) {
            for (ProductImage image : product.getImages()) {
                image.setProduct(product);
            }
        }
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id).map(existingProduct -> {

            // Standard fields
            existingProduct.setSku(productDetails.getSku());
            existingProduct.setTitle(productDetails.getTitle());
            existingProduct.setPrice(productDetails.getPrice());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setMaterialsSpecs(productDetails.getMaterialsSpecs());
            existingProduct.setShippingInfo(productDetails.getShippingInfo());
            existingProduct.setStockQuantity(productDetails.getStockQuantity());

            // Enum/Category fields
            existingProduct.setCategory(productDetails.getCategory());
            existingProduct.setProductType(productDetails.getProductType());
            existingProduct.setMusicStyle(productDetails.getMusicStyle());
            existingProduct.setItemSize(productDetails.getItemSize()); // Note: I must ensure this matches my Entity field (size vs item_size)
            existingProduct.setColor(productDetails.getColor());

            // IMAGE GALLERY UPDATE
            if (productDetails.getImages() != null) {
                // clear existing images (orphanRemoval = true in Entity will delete them from DB)
                existingProduct.getImages().clear();

                // add new images and re-establish the link
                for (ProductImage image : productDetails.getImages()) {
                    image.setProduct(existingProduct);
                    existingProduct.getImages().add(image);
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
}