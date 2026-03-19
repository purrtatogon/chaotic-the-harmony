package com.java.backend.service;

import com.java.backend.model.*;
import com.java.backend.model.enums.ProductType;
import com.java.backend.model.enums.Role;
import com.java.backend.model.enums.Size;
import com.java.backend.repository.*;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.RFC4180Parser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class CsvSeederService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(CsvSeederService.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductPriceRepository productPriceRepository;
    private final ProductInventoryRepository productInventoryRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductImageRepository productImageRepository;
    private final PasswordEncoder passwordEncoder;

    public CsvSeederService(UserRepository userRepository,
                            CategoryRepository categoryRepository,
                            ProductRepository productRepository,
                            ProductVariantRepository productVariantRepository,
                            ProductPriceRepository productPriceRepository,
                            ProductInventoryRepository productInventoryRepository,
                            OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            ProductImageRepository productImageRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.productPriceRepository = productPriceRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productImageRepository = productImageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        runSeed();
    }

    /**
     * Run the full CSV seed.
     * Idempotent: Skips records that already exist to prevent duplicate key errors.
     * Uses BaseEntity logic to force INSERTs for new records with manual IDs.
     */
    @Transactional
    public void runSeed() throws Exception {
        logger.info("Starting CSV data seeding...");

        seedUsers();
        seedCategories();
        seedProducts();
        seedVariants();

        // Flush needed so that Variants exist before Inventory tries to link to them
        productRepository.flush();
        productVariantRepository.flush();

        seedInventory();
        seedPrices();
        seedProductImages();
        seedOrders();
        seedOrderItems();

        logger.info("CSV data seeding completed successfully! Rejoice!");
    }

    private CSVReader createCsvReader(String path) throws Exception {
        ClassPathResource resource = new ClassPathResource(path);

        // debug line
        if (!resource.exists()) {
            logger.error("❌ CRITICAL: CSV file not found at path: {}", path);
            throw new java.io.FileNotFoundException("Resource not found: " + path);
        }

        logger.info("📖 Successfully found CSV file: {}", path);

        RFC4180Parser parser = new RFC4180Parser();
        return new CSVReaderBuilder(new InputStreamReader(
                resource.getInputStream(), StandardCharsets.UTF_8))
                .withCSVParser(parser)
                .withSkipLines(1)
                .build();
    }

    private boolean isValidLine(String[] line) {
        return line != null && line.length > 0 && line[0] != null && !line[0].trim().isEmpty();
    }

    private void seedUsers() throws Exception {
        try (CSVReader reader = createCsvReader("data/app_users.csv")) {
            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;
                Long id = Long.parseLong(line[0]);

                // Idempotency check: if user exists, skip to next
                if (userRepository.existsById(id)) continue;

                User user = new User();
                user.setId(id);
                user.setFullName(line[1]);
                user.setEmail(line[2]);
                user.setPassword(passwordEncoder.encode(line[3]));

                // Safety: UpperCase ensures "customer" in CSV matches "CUSTOMER" enum
                user.setRole(Role.valueOf(line[4].toUpperCase()));

                user.setPhoneNumber(line[5]);
                user.setAddress(line[6]);

                // Because User extends BaseEntity, isNew defaults to true, forcing an INSERT
                userRepository.save(user);
                count++;
            }
            if (count > 0) logger.info("Imported {} users from CSV.", count);
        }
    }

    private void seedCategories() throws Exception {
        try (CSVReader reader = createCsvReader("data/categories.csv")) {
            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;
                Long id = Long.parseLong(line[0]);
                if (categoryRepository.existsById(id)) continue;

                Category category = new Category();
                category.setId(id);
                category.setName(line[1]);
                category.setCode(line[2]);
                category.setDescription(line[3]);
                categoryRepository.save(category);
                count++;
            }
            if (count > 0) logger.info("Imported {} categories from CSV.", count);
        }
    }

    private void seedProducts() throws Exception {
        try (CSVReader reader = createCsvReader("data/products.csv")) {
            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;

                Long id = Long.parseLong(line[0]);

                // Idempotency: Skip if already exists!
                if (productRepository.existsById(id)) continue;

                Long categoryId = Long.parseLong(line[1]);
                Category category = categoryRepository.findById(categoryId).orElse(null);

                if (category != null) {
                    // Safe Enum Parsing: Returns null if invalid instead of crashing
                    ProductType type = ProductType.fromString(line[2]);

                    if (type != null) {
                        Product product = new Product();
                        product.setId(id); // BaseEntity logic ensures this is an INSERT
                        product.setCategory(category);
                        product.setProductType(type);
                        product.setThemeCode(line[3]);
                        product.setDesignCode(line[4]);
                        product.setName(line[5]);
                        product.setDescription(line[6]);
                        product.setMaterialsSpecs(line[7]);
                        product.setShippingInfo(line[8]);

                        productRepository.save(product);
                        count++;
                    } else {
                        // Log specifically which product failed due to a typo in the CSV
                        logger.warn("Skipping Product ID {}: Invalid Product Type '{}'", id, line[2]);
                    }
                } else {
                    logger.warn("Skipping Product ID {}: Category ID {} not found.", id, categoryId);
                }
            }
            if (count > 0) logger.info("Imported {} products from CSV.", count);
        }
    }

    private void seedVariants() throws Exception {
        try (CSVReader reader = createCsvReader("data/product_variants.csv")) {
            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;

                Long id = Long.parseLong(line[0]);
                Long productId = Long.parseLong(line[1]);
                String sku = line[2];

                if (productVariantRepository.existsById(id)) continue;

                // Prevent duplicate SKUs
                if (productVariantRepository.findBySku(sku).isPresent()) {
                    logger.warn("Skipping Variant ID {}: SKU '{}' already exists.", id, sku);
                    continue;
                }

                Product product = productRepository.findById(productId).orElse(null);
                if (product != null) {
                    ProductVariant variant = new ProductVariant();
                    variant.setId(id);
                    variant.setProduct(product);
                    variant.setSku(sku);
                    variant.setVariantCode(line[3]);
                    // Handle empty/null size strings safely
                    String sizeStr = (line.length > 4) ? line[4] : null;
                    variant.setSize(Size.fromString(sizeStr != null && !sizeStr.isEmpty() ? sizeStr.toUpperCase() : null));

                    productVariantRepository.save(variant);
                    count++;
                } else {
                    logger.warn("Skipping Variant ID {}: Product ID {} not found.", id, productId);
                }
            }
            if (count > 0) logger.info("Imported {} product variants from CSV.", count);
        }
    }

    private void seedInventory() throws Exception {
        try (CSVReader reader = createCsvReader("data/products_inventory.csv")) {
            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;
                Long id = Long.parseLong(line[0]);
                if (productInventoryRepository.existsById(id)) continue;

                Long variantId = Long.parseLong(line[1]);
                ProductVariant variant = productVariantRepository.findById(variantId).orElse(null);

                if (variant != null) {
                    ProductInventory inventory = new ProductInventory();
                    inventory.setId(id);
                    inventory.setProductVariant(variant);
                    inventory.setStockQuantity(Integer.parseInt(line[2]));
                    inventory.setStockLocation(line[3]);
                    productInventoryRepository.save(inventory);
                    count++;
                }
            }
            if (count > 0) logger.info("Imported inventory for {} records.", count);
        }
    }

    private void seedPrices() throws Exception {
        try (CSVReader reader = createCsvReader("data/product_prices.csv")) {
            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;
                Long id = Long.parseLong(line[0]);
                if (productPriceRepository.existsById(id)) continue;

                Long variantId = Long.parseLong(line[1]);
                ProductVariant variant = productVariantRepository.findById(variantId).orElse(null);

                if (variant != null) {
                    ProductPrice price = new ProductPrice();
                    price.setId(id);
                    price.setProductVariant(variant);
                    price.setCurrencyCode(line[2]);
                    price.setAmount(new BigDecimal(line[3]));
                    productPriceRepository.save(price);
                    count++;
                }
            }
            if (count > 0) logger.info("Imported {} product prices.", count);
        }
    }

    private void seedProductImages() throws Exception {
        try (CSVReader reader = createCsvReader("data/product_images.csv")) {
            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;
                Long id = Long.parseLong(line[0]);
                if (productImageRepository.existsById(id)) continue;

                ProductImage image = new ProductImage();
                image.setId(id);
                image.setImageUrl(line[3]);
                image.setAltText(line.length > 4 && line[4] != null && !line[4].trim().isEmpty() ? line[4] : null);
                image.setDisplayOrder(line.length > 5 && line[5] != null && !line[5].trim().isEmpty() 
                    ? Integer.parseInt(line[5]) : 1);

                // Handle product_id (can be empty/null)
                String productIdStr = line.length > 1 ? line[1] : null;
                if (productIdStr != null && !productIdStr.trim().isEmpty()) {
                    Long productId = Long.parseLong(productIdStr);
                    Product product = productRepository.findById(productId).orElse(null);
                    if (product != null) {
                        image.setProduct(product);
                    } else {
                        logger.warn("Skipping Image ID {}: Product ID {} not found.", id, productId);
                        continue;
                    }
                }

                // Handle variant_id (can be empty/null)
                String variantIdStr = line.length > 2 ? line[2] : null;
                if (variantIdStr != null && !variantIdStr.trim().isEmpty()) {
                    Long variantId = Long.parseLong(variantIdStr);
                    ProductVariant variant = productVariantRepository.findById(variantId).orElse(null);
                    if (variant != null) {
                        image.setProductVariant(variant);
                    } else {
                        logger.warn("Skipping Image ID {}: Variant ID {} not found.", id, variantId);
                        continue;
                    }
                }

                // Ensure at least one relationship exists
                if (image.getProduct() == null && image.getProductVariant() == null) {
                    logger.warn("Skipping Image ID {}: Neither product_id nor variant_id provided.", id);
                    continue;
                }

                productImageRepository.save(image);
                count++;
            }
            if (count > 0) logger.info("Imported {} product images.", count);
        }
    }

    private void seedOrders() throws Exception {
        // Flexible date formatter
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d/yy H:mm", Locale.ENGLISH);

        try (CSVReader reader = createCsvReader("data/orders.csv")) {
            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;
                Long id = Long.parseLong(line[0]);
                if (orderRepository.existsById(id)) continue;

                String email = line[1];
                User user = userRepository.findByEmail(email).orElse(null);

                if (user != null) {
                    Order order = new Order();
                    order.setId(id);
                    order.setCustomer(user);
                    order.setOrderDate(LocalDateTime.parse(line[2], formatter));
                    order.setStatus(line[3]);
                    order.setTotalAmount(new BigDecimal(line[4]));
                    order.setCurrency(line[5]);
                    order.setShippingAddress(line[6]);
                    orderRepository.save(order);
                    count++;
                }
            }
            if (count > 0) logger.info("Imported {} orders.", count);
        }
    }

    private void seedOrderItems() throws Exception {
        try (CSVReader reader = createCsvReader("data/order_items.csv")) {
            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;
                Long id = Long.parseLong(line[0]);
                if (orderItemRepository.existsById(id)) continue;

                Long orderId = Long.parseLong(line[1]);
                Long variantId = Long.parseLong(line[2]);

                Order order = orderRepository.findById(orderId).orElse(null);
                ProductVariant variant = productVariantRepository.findById(variantId).orElse(null);

                if (order != null && variant != null) {
                    OrderItem item = new OrderItem();
                    item.setId(id);
                    item.setOrder(order);
                    item.setVariant(variant);
                    item.setQuantity(Integer.parseInt(line[3]));
                    item.setPriceAtPurchase(new BigDecimal(line[4]));
                    orderItemRepository.save(item);
                    count++;
                }
            }
            if (count > 0) logger.info("Imported {} order items.", count);
        }
    }
}