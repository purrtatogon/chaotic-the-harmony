package com.java.backend.service;

import com.java.backend.model.*;
import com.java.backend.model.enums.ProductType;
import com.java.backend.model.enums.Role;
import com.java.backend.model.enums.Size;
import com.java.backend.repository.*;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.RFC4180Parser;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import net.datafaker.Faker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * Loads CSV catalog data and deterministic demo personas when the database has no users yet.
 * Empty-db detection avoids duplicate inserts when {@code ddl-auto=update} keeps data across restarts.
 */
@Service
public class DatabaseSeederService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeederService.class);

    private static final String DEMO_STAFF_PASSWORD = "CTH-backline!123";
    private static final String DEMO_CUSTOMER_PASSWORD = "demoCTHcustomer!123";
    private static final int CUSTOMER_COUNT = 100;
    private static final int STAFF_COUNT = 5;
    private static final int FIXED_CUSTOMER_COUNT = 3;

    private static final int RECENT_ORDER_WINDOW_DAYS = 3;

    private static final List<Object[]> DEMO_STAFF_USERS = List.of(
            new Object[]{1L, "Duke Silver",     "d.silver@cth-backline.com",  Role.ADMIN},
            new Object[]{2L, "Phoebe Buffay",   "p.buffay@cth-backline.com",  Role.MANAGER},
            new Object[]{3L, "Cameron Tucker",  "c.tucker@cth-backline.com",  Role.SUPPORT},
            new Object[]{4L, "Jason Mendoza",   "j.mendoza@cth-backline.com", Role.STAFF},
            new Object[]{5L, "Kevin Malone",    "k.malone@cth-backline.com",  Role.AUDITOR}
    );

    private static final long TROY_ID    = 6L;
    private static final long DEWEY_ID   = 7L;
    private static final long BARBARA_ID = 8L;

    private static final List<Object[]> FIXED_CUSTOMERS = List.of(
            new Object[]{TROY_ID,    "Troy Barnes",     "t.barnes@greendale.edu",   "555-867-5309", "Apt 303, Greendale, CO 80401"},
            new Object[]{DEWEY_ID,   "Dewey Wilkerson", "d.wilkerson@luckyaid.com", "555-MUZIK-01", "12850 Riverside Dr, Lucky Aid Plaza, CA 91607"},
            new Object[]{BARBARA_ID, "Barbara Howard",  "b.howard@abbott.edu",      "215-555-0147", "4200 Chestnut St, Philadelphia, PA 19104"}
    );

    private static final long[] TROY_VINYL_VARIANT_IDS = {
            1009,
            1010, 1011, 1012,
            1013, 1014,
            1015,
            1016,
            1017, 1018, 1019, 1020,
            1021, 1022, 1023,
    };

    private static final long[] BARBARA_VARIANT_IDS = {
            1009,
            1015,
            1017,
    };

    @PersistenceContext
    private EntityManager entityManager;

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductPriceRepository productPriceRepository;
    private final ProductInventoryRepository productInventoryRepository;
    private final OrderRepository orderRepository;
    private final ProductImageRepository productImageRepository;
    private final SiteContentRepository siteContentRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeederService(UserRepository userRepository,
                                 CategoryRepository categoryRepository,
                                 ProductRepository productRepository,
                                 ProductVariantRepository productVariantRepository,
                                 ProductPriceRepository productPriceRepository,
                                 ProductInventoryRepository productInventoryRepository,
                                 OrderRepository orderRepository,
                                 ProductImageRepository productImageRepository,
                                 SiteContentRepository siteContentRepository,
                                 AuditLogRepository auditLogRepository,
                                 PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.productPriceRepository = productPriceRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.orderRepository = orderRepository;
        this.productImageRepository = productImageRepository;
        this.siteContentRepository = siteContentRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            logger.info("Skipping database seed — users already exist.");
            return;
        }

        logger.info("Starting database seed (empty user table)...");

        migrateRoleConstraint();
        entityManager.flush();

        seedStaffUsers();
        seedFixedCustomers();

        seedCategories();
        seedProducts();
        seedVariants();

        productRepository.flush();
        productVariantRepository.flush();

        seedInventory();
        seedPrices();
        seedProductImages();
        seedSiteContent();

        List<User> fakerCustomers = seedFakerCustomers();

        generateFixedCustomerOrders(resolveFixedCustomersOrdered());
        generateOrders(fakerCustomers);
        seedAuditLog();

        logger.info("Database seed completed.");
    }

    private void migrateRoleConstraint() {
        try {
            entityManager.createNativeQuery(
                "ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check"
            ).executeUpdate();
            entityManager.createNativeQuery(
                "ALTER TABLE app_users ADD CONSTRAINT app_users_role_check " +
                "CHECK (role IN ('CUSTOMER','ADMIN','MANAGER','STAFF','SUPPORT','AUDITOR'))"
            ).executeUpdate();
        } catch (Exception e) {
            logger.warn("Could not update role constraint: {}", e.getMessage());
        }
    }

    private void seedStaffUsers() {
        String encodedPassword = passwordEncoder.encode(DEMO_STAFF_PASSWORD);
        List<User> batch = new ArrayList<>(DEMO_STAFF_USERS.size());
        for (Object[] row : DEMO_STAFF_USERS) {
            User user = new User();
            user.setId((Long) row[0]);
            user.setFullName((String) row[1]);
            user.setEmail((String) row[2]);
            user.setPassword(encodedPassword);
            user.setRole((Role) row[3]);
            batch.add(user);
        }
        userRepository.saveAll(batch);
        logger.info("Seeded {} hardcoded demo staff users.", DEMO_STAFF_USERS.size());
    }

    private void seedFixedCustomers() {
        String encodedPassword = passwordEncoder.encode(DEMO_CUSTOMER_PASSWORD);
        List<User> batch = new ArrayList<>(FIXED_CUSTOMER_COUNT);
        for (Object[] row : FIXED_CUSTOMERS) {
            User user = new User();
            user.setId((Long) row[0]);
            user.setFullName((String) row[1]);
            user.setEmail((String) row[2]);
            user.setPassword(encodedPassword);
            user.setRole(Role.CUSTOMER);
            user.setPhoneNumber((String) row[3]);
            user.setAddress((String) row[4]);
            batch.add(user);
        }
        userRepository.saveAll(batch);
        backdateFixedCustomerAccounts();
        logger.info("Seeded {} fixed demo customers (Troy, Dewey, Barbara).", FIXED_CUSTOMER_COUNT);
    }

    private List<User> resolveFixedCustomersOrdered() {
        List<Long> ids = List.of(TROY_ID, DEWEY_ID, BARBARA_ID);
        Map<Long, User> byId = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        return ids.stream().map(byId::get).filter(Objects::nonNull).toList();
    }

    private List<User> resolveStaffUsersOrdered() {
        List<Long> ids = DEMO_STAFF_USERS.stream().map(row -> (Long) row[0]).toList();
        Map<Long, User> byId = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        return ids.stream().map(byId::get).filter(Objects::nonNull).toList();
    }

    private void backdateFixedCustomerAccounts() {
        LocalDate today = LocalDate.now();

        LocalDateTime troyCreated    = today.minusMonths(18).minusDays(5).atTime(9, 14);
        LocalDateTime deweyCreated   = today.minusMonths(8).minusDays(12).atTime(15, 42);
        LocalDateTime barbaraCreated = today.minusMonths(10).minusDays(3).atTime(11, 7);

        entityManager.createNativeQuery(
            "UPDATE app_users SET created_at = :d WHERE id = :id")
            .setParameter("d", troyCreated).setParameter("id", TROY_ID)
            .executeUpdate();
        entityManager.createNativeQuery(
            "UPDATE app_users SET created_at = :d WHERE id = :id")
            .setParameter("d", deweyCreated).setParameter("id", DEWEY_ID)
            .executeUpdate();
        entityManager.createNativeQuery(
            "UPDATE app_users SET created_at = :d WHERE id = :id")
            .setParameter("d", barbaraCreated).setParameter("id", BARBARA_ID)
            .executeUpdate();

        logger.info("Backdated fixed customer accounts: Troy={}, Dewey={}, Barbara={}",
            troyCreated.toLocalDate(), deweyCreated.toLocalDate(), barbaraCreated.toLocalDate());
    }

    private List<User> seedFakerCustomers() {
        Faker faker = new Faker(Locale.of("en", "US"));
        String encodedPassword = passwordEncoder.encode(DEMO_CUSTOMER_PASSWORD);
        List<User> batch = new ArrayList<>(CUSTOMER_COUNT);

        for (int i = 0; i < CUSTOMER_COUNT; i++) {
            long id = STAFF_COUNT + FIXED_CUSTOMER_COUNT + 1L + i;
            User user = new User();
            user.setId(id);
            user.setFullName(faker.name().fullName());
            user.setEmail(faker.internet().emailAddress());
            user.setPassword(encodedPassword);
            user.setRole(Role.CUSTOMER);
            user.setPhoneNumber(faker.phoneNumber().cellPhone());
            user.setAddress(faker.address().fullAddress());
            batch.add(user);
        }
        userRepository.saveAll(batch);
        logger.info("Generated {} Datafaker customer accounts.", batch.size());
        return batch;
    }

    private void generateFixedCustomerOrders(List<User> fixedCustomers) {
        User troy    = fixedCustomers.stream().filter(u -> u.getId().equals(TROY_ID)).findFirst().orElse(null);
        User barbara = fixedCustomers.stream().filter(u -> u.getId().equals(BARBARA_ID)).findFirst().orElse(null);

        List<User> staffUsers = resolveStaffUsersOrdered();
        User staffDefault = staffUsers.isEmpty() ? null : staffUsers.get(0);

        List<Order> toPersist = new ArrayList<>();

        long orderIdCounter = 1;
        long itemIdCounter = 1;

        LocalDate today = LocalDate.now();
        LocalDateTime ceiling = today.minusDays(RECENT_ORDER_WINDOW_DAYS).atTime(23, 59);

        LocalDate troyJoined = today.minusMonths(18).minusDays(5);
        LocalDate barbaraJoined = today.minusMonths(10).minusDays(3);

        if (troy != null) {
            int orderCount = TROY_VINYL_VARIANT_IDS.length;
            long spanDays = java.time.temporal.ChronoUnit.DAYS.between(troyJoined, today.minusDays(7));
            long slotSize = Math.max(spanDays / orderCount, 1);

            for (int i = 0; i < orderCount; i++) {
                ProductVariant variant = productVariantRepository.findById(TROY_VINYL_VARIANT_IDS[i]).orElse(null);
                if (variant == null) continue;

                LocalDate orderDay = troyJoined.plusDays(slotSize * i + (i % 3));
                if (orderDay.isAfter(today.minusDays(4))) {
                    orderDay = today.minusDays(4 + (orderCount - i));
                }
                if (orderDay.isBefore(troyJoined)) orderDay = troyJoined.plusDays(1);
                LocalDateTime orderDate = orderDay.atTime(10 + (i % 10), 15 + (i * 7) % 45);
                if (orderDate.isAfter(ceiling)) orderDate = ceiling.minusDays(i + 1);

                BigDecimal price = lookupEurPrice(variant);
                int qty = (i % 3 == 0) ? 2 : 1;

                Order order = new Order();
                order.setId(orderIdCounter++);
                order.setCustomer(troy);
                order.setOrderDate(orderDate);
                order.setStatus("DELIVERED");
                order.setCurrency("EUR");
                order.setShippingAddress(troy.getAddress());
                order.setUpdatedBy(staffDefault);

                LocalDateTime shipped = clampBeforeToday(orderDate.plusDays(1));
                LocalDateTime delivered = clampBeforeToday(shipped.plusDays(2));
                order.setShippedAt(shipped);
                order.setDeliveredAt(delivered);

                OrderItem item = new OrderItem();
                item.setId(itemIdCounter++);
                item.setOrder(order);
                item.setVariant(variant);
                item.setQuantity(qty);
                item.setPriceAtPurchase(price);

                BigDecimal total = price.multiply(BigDecimal.valueOf(qty));
                order.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP));
                order.setItems(List.of(item));
                toPersist.add(order);
            }
            logger.info("Seeded {} vinyl orders for Troy Barnes (Mega-Fan).", TROY_VINYL_VARIANT_IDS.length);
        }

        logger.info("Dewey Wilkerson seeded with 0 orders (wishlist is client-side localStorage).");

        if (barbara != null) {
            List<ProductVariant> allVariants = productVariantRepository.findAll();
            String[] barbaraStatuses = {"DELIVERED", "DELIVERED", "DELIVERED", "CANCELLED", "CANCELLED"};

            long barbaraSpan = java.time.temporal.ChronoUnit.DAYS.between(barbaraJoined, today.minusDays(7));
            long barbaraSlot = Math.max(barbaraSpan / barbaraStatuses.length, 7);

            for (int i = 0; i < barbaraStatuses.length; i++) {
                LocalDate orderDay = barbaraJoined.plusDays(barbaraSlot * i + 5);
                if (orderDay.isAfter(today.minusDays(5))) {
                    orderDay = today.minusDays(5 + (barbaraStatuses.length - i));
                }
                if (orderDay.isBefore(barbaraJoined)) orderDay = barbaraJoined.plusDays(1);
                LocalDateTime orderDate = orderDay.atTime(14, 15 + i * 10);
                if (orderDate.isAfter(ceiling)) orderDate = ceiling.minusDays(i + 1);

                Order order = new Order();
                order.setId(orderIdCounter++);
                order.setCustomer(barbara);
                order.setOrderDate(orderDate);
                order.setStatus(barbaraStatuses[i]);
                order.setCurrency("EUR");
                order.setShippingAddress(barbara.getAddress());
                order.setUpdatedBy(staffDefault);

                if ("DELIVERED".equals(barbaraStatuses[i])) {
                    LocalDateTime shipped = clampBeforeToday(orderDate.plusDays(1));
                    LocalDateTime delivered = clampBeforeToday(shipped.plusDays(3));
                    order.setShippedAt(shipped);
                    order.setDeliveredAt(delivered);
                }

                List<OrderItem> items = new ArrayList<>();
                BigDecimal total = BigDecimal.ZERO;
                int itemsInOrder = 3 + i;

                for (int j = 0; j < itemsInOrder; j++) {
                    long varIdx;
                    if (j < BARBARA_VARIANT_IDS.length) {
                        varIdx = BARBARA_VARIANT_IDS[j];
                    } else {
                        varIdx = allVariants.get((i * 7 + j * 3) % allVariants.size()).getId();
                    }

                    ProductVariant variant = productVariantRepository.findById(varIdx).orElse(
                            allVariants.get(j % allVariants.size())
                    );

                    BigDecimal price = lookupEurPrice(variant);
                    int qty = (j == 0) ? 3 : 2;

                    OrderItem item = new OrderItem();
                    item.setId(itemIdCounter++);
                    item.setOrder(order);
                    item.setVariant(variant);
                    item.setQuantity(qty);
                    item.setPriceAtPurchase(price);
                    items.add(item);

                    total = total.add(price.multiply(BigDecimal.valueOf(qty)));
                }

                order.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP));
                order.setItems(items);
                toPersist.add(order);
            }
            logger.info("Seeded 5 orders for Barbara Howard (Complex Account: 3 Delivered, 2 Cancelled).");
        }

        if (!toPersist.isEmpty()) {
            orderRepository.saveAll(toPersist);
        }
    }

    private LocalDateTime clampBeforeToday(LocalDateTime dt) {
        LocalDateTime limit = LocalDateTime.now().minusHours(1);
        return dt.isAfter(limit) ? limit : dt;
    }

    private void generateOrders(List<User> customers) {
        Faker faker = new Faker();
        int currentYear = LocalDate.now().getYear();
        int previousYear = currentYear - 1;
        LocalDateTime recentCutoff = LocalDateTime.now().minusDays(RECENT_ORDER_WINDOW_DAYS);

        List<ProductVariant> allVariants = productVariantRepository.findAll();
        if (allVariants.isEmpty()) {
            logger.warn("No product variants found; skipping order generation.");
            return;
        }

        List<User> staffUsers = resolveStaffUsersOrdered();
        if (staffUsers.isEmpty()) {
            logger.warn("No staff users found; skipping faker order generation.");
            return;
        }

        int orderCount = faker.number().numberBetween(200, 501);
        long orderIdCounter = 100;
        long itemIdCounter = 500;
        int currentYearOrders = 0;
        int previousYearOrders = 0;

        List<Order> batch = new ArrayList<>(orderCount);

        for (int i = 0; i < orderCount; i++) {
            User customer = customers.get(faker.number().numberBetween(0, customers.size()));
            User staffMember = staffUsers.get(faker.number().numberBetween(0, staffUsers.size()));

            boolean isCurrentYear = faker.number().numberBetween(1, 101) <= 70;
            int year = isCurrentYear ? currentYear : previousYear;
            LocalDateTime orderDate = randomDateInYear(year);

            String status = resolveStatus(faker, year, currentYear, orderDate, recentCutoff);

            Order order = new Order();
            order.setId(orderIdCounter++);
            order.setCustomer(customer);
            order.setOrderDate(orderDate);
            order.setStatus(status);
            order.setCurrency("EUR");
            order.setShippingAddress(customer.getAddress());
            order.setUpdatedBy(staffMember);

            applyFulfillmentDates(order, status, orderDate, faker);

            int itemCount = faker.number().numberBetween(1, 5);
            BigDecimal totalAmount = BigDecimal.ZERO;
            List<OrderItem> items = new ArrayList<>();

            for (int j = 0; j < itemCount; j++) {
                ProductVariant variant = allVariants.get(
                    faker.number().numberBetween(0, allVariants.size())
                );

                BigDecimal price = lookupEurPrice(variant);
                int quantity = faker.number().numberBetween(1, 4);

                OrderItem item = new OrderItem();
                item.setId(itemIdCounter++);
                item.setOrder(order);
                item.setVariant(variant);
                item.setQuantity(quantity);
                item.setPriceAtPurchase(price);
                items.add(item);

                totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(quantity)));
            }

            order.setTotalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP));
            order.setItems(items);
            batch.add(order);

            if (isCurrentYear) currentYearOrders++; else previousYearOrders++;
        }

        orderRepository.saveAll(batch);

        logger.info("Generated {} orders ({} in {}, {} in {}).",
                orderCount, currentYearOrders, currentYear, previousYearOrders, previousYear);
    }

    private String resolveStatus(Faker faker, int orderYear, int currentYear,
                                 LocalDateTime orderDate, LocalDateTime recentCutoff) {
        if (orderYear < currentYear) {
            return faker.number().numberBetween(1, 101) <= 90 ? "DELIVERED" : "CANCELLED";
        }

        if (orderDate.isAfter(recentCutoff)) {
            return faker.number().numberBetween(1, 101) <= 70 ? "PROCESSING" : "SHIPPED";
        }

        int roll = faker.number().numberBetween(1, 101);
        if (roll <= 85) return "DELIVERED";
        if (roll <= 95) return "SHIPPED";
        return "CANCELLED";
    }

    private void applyFulfillmentDates(Order order, String status,
                                       LocalDateTime orderDate, Faker faker) {
        if ("PROCESSING".equals(status) || "CANCELLED".equals(status)) {
            return;
        }

        int shipDays = faker.number().numberBetween(1, 3);
        LocalDateTime shippedAt = orderDate.plusDays(shipDays);
        order.setShippedAt(shippedAt);

        if ("DELIVERED".equals(status)) {
            int deliveryDays = faker.number().numberBetween(1, 3);
            order.setDeliveredAt(shippedAt.plusDays(deliveryDays));
        }
    }

    private BigDecimal lookupEurPrice(ProductVariant variant) {
        return productPriceRepository
                .findByProductVariantAndCurrencyCode(variant, "EUR")
                .map(ProductPrice::getAmount)
                .orElse(new BigDecimal("19.99"));
    }

    private LocalDateTime randomDateInYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = (year == LocalDate.now().getYear()) ? LocalDate.now() : LocalDate.of(year, 12, 31);
        long randomDay = ThreadLocalRandom.current().nextLong(start.toEpochDay(), end.toEpochDay() + 1);
        LocalDate date = LocalDate.ofEpochDay(randomDay);

        int hour = ThreadLocalRandom.current().nextInt(8, 22);
        int minute = ThreadLocalRandom.current().nextInt(0, 60);
        return LocalDateTime.of(date, LocalTime.of(hour, minute));
    }

    private CSVReader createCsvReader(String path) throws Exception {
        ClassPathResource resource = new ClassPathResource(path);
        if (!resource.exists()) {
            throw new java.io.FileNotFoundException("Resource not found: " + path);
        }
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

    private void seedCategories() throws Exception {
        try (CSVReader reader = createCsvReader("data/categories.csv")) {
            List<Category> batch = new ArrayList<>();
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;

                Category category = new Category();
                category.setId(Long.parseLong(line[0]));
                category.setName(line[1]);
                category.setCode(line[2]);
                category.setDescription(line[3]);
                batch.add(category);
            }
            categoryRepository.saveAll(batch);
            logger.info("Imported {} categories from CSV.", batch.size());
        }
    }

    private void seedProducts() throws Exception {
        Map<Long, Category> categoriesById = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        try (CSVReader reader = createCsvReader("data/products.csv")) {
            List<Product> batch = new ArrayList<>();
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;

                Long categoryId = Long.parseLong(line[1]);
                Category category = categoriesById.get(categoryId);
                if (category == null) {
                    logger.warn("Skipping Product ID {}: Category {} not found.", line[0], categoryId);
                    continue;
                }

                ProductType type = ProductType.fromString(line[2]);
                if (type == null) {
                    logger.warn("Skipping Product ID {}: Invalid type '{}'.", line[0], line[2]);
                    continue;
                }

                Product product = new Product();
                product.setId(Long.parseLong(line[0]));
                product.setCategory(category);
                product.setProductType(type);
                product.setThemeCode(line[3]);
                product.setDesignCode(line[4]);
                product.setName(line[5]);
                product.setDescription(line[6]);
                product.setMaterialsSpecs(line[7]);
                product.setShippingInfo(line[8]);
                batch.add(product);
            }
            productRepository.saveAll(batch);
            logger.info("Imported {} products from CSV.", batch.size());
        }
    }

    private void seedVariants() throws Exception {
        Map<Long, Product> productsById = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        try (CSVReader reader = createCsvReader("data/product_variants.csv")) {
            List<ProductVariant> batch = new ArrayList<>();
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;

                Long productId = Long.parseLong(line[1]);
                Product product = productsById.get(productId);
                if (product == null) {
                    logger.warn("Skipping Variant ID {}: Product {} not found.", line[0], productId);
                    continue;
                }

                ProductVariant variant = new ProductVariant();
                variant.setId(Long.parseLong(line[0]));
                variant.setProduct(product);
                variant.setSku(line[2]);
                variant.setVariantCode(line[3]);
                String sizeStr = (line.length > 4) ? line[4] : null;
                variant.setSize(Size.fromString(
                    sizeStr != null && !sizeStr.isEmpty() ? sizeStr.toUpperCase() : null
                ));
                batch.add(variant);
            }
            productVariantRepository.saveAll(batch);
            logger.info("Imported {} product variants from CSV.", batch.size());
        }
    }

    private void seedInventory() throws Exception {
        Map<Long, ProductVariant> variantsById = productVariantRepository.findAll().stream()
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        try (CSVReader reader = createCsvReader("data/products_inventory.csv")) {
            List<ProductInventory> batch = new ArrayList<>();
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;

                Long variantId = Long.parseLong(line[1]);
                ProductVariant variant = variantsById.get(variantId);
                if (variant == null) continue;

                ProductInventory inventory = new ProductInventory();
                inventory.setId(Long.parseLong(line[0]));
                inventory.setProductVariant(variant);
                inventory.setStockQuantity(Integer.parseInt(line[2]));
                inventory.setStockLocation(line[3]);
                batch.add(inventory);
            }
            productInventoryRepository.saveAll(batch);
            logger.info("Imported inventory for {} records.", batch.size());
        }
    }

    private void seedPrices() throws Exception {
        Map<Long, ProductVariant> variantsById = productVariantRepository.findAll().stream()
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        try (CSVReader reader = createCsvReader("data/product_prices.csv")) {
            List<ProductPrice> batch = new ArrayList<>();
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;

                Long variantId = Long.parseLong(line[1]);
                ProductVariant variant = variantsById.get(variantId);
                if (variant == null) continue;

                ProductPrice price = new ProductPrice();
                price.setId(Long.parseLong(line[0]));
                price.setProductVariant(variant);
                price.setCurrencyCode(line[2]);
                price.setAmount(new BigDecimal(line[3]));
                batch.add(price);
            }
            productPriceRepository.saveAll(batch);
            logger.info("Imported {} product prices.", batch.size());
        }
    }

    private void seedProductImages() throws Exception {
        Map<Long, Product> productsById = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        Map<Long, ProductVariant> variantsById = productVariantRepository.findAll().stream()
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        try (CSVReader reader = createCsvReader("data/product_images.csv")) {
            List<ProductImage> batch = new ArrayList<>();
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (!isValidLine(line)) continue;
                Long id = Long.parseLong(line[0]);

                ProductImage image = new ProductImage();
                image.setId(id);
                image.setImageUrl(line[3]);
                image.setAltText(line.length > 4 && line[4] != null && !line[4].trim().isEmpty() ? line[4] : null);
                image.setDisplayOrder(line.length > 5 && line[5] != null && !line[5].trim().isEmpty()
                    ? Integer.parseInt(line[5]) : 1);

                String productIdStr = line.length > 1 ? line[1] : null;
                if (productIdStr != null && !productIdStr.trim().isEmpty()) {
                    Product product = productsById.get(Long.parseLong(productIdStr));
                    if (product != null) {
                        image.setProduct(product);
                    } else {
                        logger.warn("Skipping Image ID {}: Product {} not found.", id, productIdStr);
                        continue;
                    }
                }

                String variantIdStr = line.length > 2 ? line[2] : null;
                if (variantIdStr != null && !variantIdStr.trim().isEmpty()) {
                    ProductVariant variant = variantsById.get(Long.parseLong(variantIdStr));
                    if (variant != null) {
                        image.setProductVariant(variant);
                    } else {
                        logger.warn("Skipping Image ID {}: Variant {} not found.", id, variantIdStr);
                        continue;
                    }
                }

                if (image.getProduct() == null && image.getProductVariant() == null) {
                    logger.warn("Skipping Image ID {}: No product or variant reference.", id);
                    continue;
                }

                batch.add(image);
            }
            productImageRepository.saveAll(batch);
            logger.info("Imported {} product images.", batch.size());
        }
    }

    private void seedSiteContent() throws Exception {
        String[] paths = {
                "data/cms_global.csv",
                "data/cms_home.csv",
                "data/cms_music.csv",
                "data/cms_about.csv",
                "data/cms_media.csv",
                "data/cms_store.csv",
                "data/cms_support.csv"
        };

        List<SiteContentEntry> batch = new ArrayList<>();
        for (String path : paths) {
            try (CSVReader reader = createCsvReader(path)) {
                String[] line;
                while ((line = reader.readNext()) != null) {
                    if (!isValidLine(line) || line.length < 2) continue;

                    SiteContentEntry entry = new SiteContentEntry();
                    entry.setSection(line[0].trim());
                    entry.setEntryKey(line[1].trim());
                    entry.setTitle(line.length > 2 && line[2] != null ? line[2] : "");
                    entry.setContent(line.length > 3 && line[3] != null ? line[3] : "");
                    batch.add(entry);
                }
            }
        }
        siteContentRepository.saveAll(batch);
        logger.info("Imported {} site content rows from cms_*.csv.", batch.size());
    }

    private void seedAuditLog() {
        logger.info("Seeding audit log entries...");
        List<User> staff = userRepository.findAll().stream()
                .filter(u -> u.getRole() != Role.CUSTOMER)
                .toList();
        if (staff.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        List<AuditLog> entries = List.of(
                new AuditLog("ORDER_STATUS_UPDATED", "Updated Order #1 to SHIPPED",
                        "ORDER", 1L, staff.get(0), now.minusHours(2)),
                new AuditLog("STOCK_UPDATED", "Updated stock on CD-SPRK-001-STD to 130",
                        "PRODUCT", 100L, staff.get(1 % staff.size()), now.minusHours(4)),
                new AuditLog("ORDER_STATUS_UPDATED", "Updated Order #5 to DELIVERED",
                        "ORDER", 5L, staff.get(2 % staff.size()), now.minusHours(6)),
                new AuditLog("PRODUCT_UPDATED", "Updated product: Sparks of Chaos - CD",
                        "PRODUCT", 100L, staff.get(0), now.minusHours(8)),
                new AuditLog("USER_UPDATED", "Updated user: Cameron Tucker",
                        "USER", 3L, staff.get(0), now.minusHours(12)),
                new AuditLog("STOCK_UPDATED", "Updated stock on VNL-SPRK-001-STD to 45",
                        "PRODUCT", 101L, staff.get(3 % staff.size()), now.minusDays(1)),
                new AuditLog("ORDER_STATUS_UPDATED", "Updated Order #12 to CANCELLED",
                        "ORDER", 12L, staff.get(0), now.minusDays(1).minusHours(3)),
                new AuditLog("CATEGORY_UPDATED", "Updated category: Music",
                        "CATEGORY", 1L, staff.get(1 % staff.size()), now.minusDays(2)),
                new AuditLog("CONTENT_UPDATED", "Updated content: hero / tagline",
                        "CONTENT", 1L, staff.get(0), now.minusDays(2).minusHours(5)),
                new AuditLog("ORDER_STATUS_UPDATED", "Updated Order #20 to SHIPPED",
                        "ORDER", 20L, staff.get(4 % staff.size()), now.minusDays(3))
        );
        auditLogRepository.saveAll(entries);
        logger.info("Seeded {} audit log entries.", entries.size());
    }
}
