package com.java.backend.controller;

import com.java.backend.dto.DashboardStatsDTO;
import com.java.backend.model.AuditLog;
import com.java.backend.model.Order;
import com.java.backend.model.OrderItem;
import com.java.backend.model.Product;
import com.java.backend.model.User;
import com.java.backend.model.enums.Role;
import com.java.backend.repository.AuditLogRepository;
import com.java.backend.repository.ProductRepository;
import com.java.backend.repository.ProductInventoryRepository;
import com.java.backend.repository.OrderRepository;
import com.java.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/** Admin home metrics: counts, recent activity mix, top SKUs (all in-memory aggregates for now). */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final ProductRepository productRepository;
    private final ProductInventoryRepository productInventoryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardController(ProductRepository productRepository,
                               ProductInventoryRepository productInventoryRepository,
                               OrderRepository orderRepository,
                               UserRepository userRepository,
                               AuditLogRepository auditLogRepository) {
        this.productRepository = productRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // 1. PRODUCT / INVENTORY STATS
        stats.setTotalProducts(productRepository.count());
        stats.setLowStockCount(productInventoryRepository.countByStockQuantityLessThan(10));
        stats.setOutOfStockCount(productInventoryRepository.countByStockQuantity(0));

        // 2. ORDER STATS — lifetime
        List<Order> allOrders = orderRepository.findAll();
        stats.setTotalOrders(allOrders.size());

        BigDecimal totalSales = allOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalSales(totalSales.setScale(2, RoundingMode.HALF_UP));

        if (!allOrders.isEmpty()) {
            stats.setAverageOrderValue(
                    totalSales.divide(BigDecimal.valueOf(allOrders.size()), 2, RoundingMode.HALF_UP));
        } else {
            stats.setAverageOrderValue(BigDecimal.ZERO);
        }

        // 3. TIME-SCOPED PULSE METRICS
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        YearMonth currentMonth = YearMonth.from(today);
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();

        int ordersToday = 0;
        int pendingOrders = 0;
        BigDecimal revenueThisMonth = BigDecimal.ZERO;

        for (Order order : allOrders) {
            LocalDateTime orderDate = order.getOrderDate();
            if (orderDate != null && !orderDate.isBefore(startOfToday)) {
                ordersToday++;
            }
            if (orderDate != null && !orderDate.isBefore(startOfMonth)) {
                revenueThisMonth = revenueThisMonth.add(order.getTotalAmount());
            }
            if ("PROCESSING".equals(order.getStatus())) {
                pendingOrders++;
            }
        }

        stats.setOrdersToday(ordersToday);
        stats.setRevenueThisMonth(revenueThisMonth.setScale(2, RoundingMode.HALF_UP));
        stats.setPendingOrders(pendingOrders);

        // 4. CUSTOMER STATS
        List<User> customers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.CUSTOMER)
                .collect(Collectors.toList());

        stats.setTotalCustomers(customers.size());
        stats.setNewCustomersThisMonth((int) customers.stream()
                .filter(u -> u.getCreatedAt() != null && !u.getCreatedAt().isBefore(startOfMonth))
                .count());

        // 5. UNIFIED ACTIVITY FEED
        List<DashboardStatsDTO.RecentActivityDTO> activities = new ArrayList<>();

        // Recent orders as system events
        allOrders.stream()
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
                .limit(5)
                .forEach(order -> activities.add(new DashboardStatsDTO.RecentActivityDTO(
                        "ORD-" + order.getId(),
                        "Order #" + order.getId() + " placed by "
                                + (order.getCustomer() != null ? order.getCustomer().getFullName() : "Unknown"),
                        order.getOrderDate().toString(),
                        "ORDER"
                )));

        // Recent customer registrations
        customers.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(3)
                .forEach(user -> activities.add(new DashboardStatsDTO.RecentActivityDTO(
                        "USR-" + user.getId(),
                        "Customer registered: " + user.getFullName(),
                        user.getCreatedAt().toString(),
                        "USER"
                )));

        // Staff actions from audit log
        List<AuditLog> recentLogs = auditLogRepository.findTop15ByOrderByPerformedAtDesc();
        for (AuditLog log : recentLogs) {
            String performer = log.getPerformedBy() != null
                    ? log.getPerformedBy().getFullName()
                    : "System";
            activities.add(new DashboardStatsDTO.RecentActivityDTO(
                    "AUDIT-" + log.getId(),
                    performer + ": " + log.getDescription(),
                    log.getPerformedAt().toString(),
                    "STAFF"
            ));
        }

        // Sort all events by timestamp descending, take top 10
        activities.sort((a, b) -> b.getTime().compareTo(a.getTime()));
        stats.setRecentActivity(activities.subList(0, Math.min(10, activities.size())));

        // 6. TOP SELLING PRODUCTS
        Map<String, Long> productSales = new HashMap<>();
        Map<String, BigDecimal> productRevenue = new HashMap<>();
        Map<String, BigDecimal> productUnitPrice = new HashMap<>();
        Map<String, Long> productIdMap = new HashMap<>();

        for (Order order : allOrders) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getVariant().getProduct();
                String productName = product.getName();
                productSales.merge(productName, (long) item.getQuantity(), Long::sum);

                BigDecimal itemRevenue = item.getPriceAtPurchase()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                productRevenue.merge(productName, itemRevenue, BigDecimal::add);

                productUnitPrice.putIfAbsent(productName, item.getPriceAtPurchase());
                productIdMap.putIfAbsent(productName, product.getId());
            }
        }

        List<DashboardStatsDTO.TopProductDTO> topProducts = productSales.entrySet().stream()
                .map(entry -> new DashboardStatsDTO.TopProductDTO(
                        productIdMap.get(entry.getKey()),
                        entry.getKey(),
                        entry.getValue(),
                        productRevenue.get(entry.getKey()).setScale(2, RoundingMode.HALF_UP),
                        productUnitPrice.getOrDefault(entry.getKey(), BigDecimal.ZERO)
                                .setScale(2, RoundingMode.HALF_UP)
                ))
                .sorted((a, b) -> Long.compare(b.getSold(), a.getSold()))
                .limit(5)
                .collect(Collectors.toList());

        stats.setTopSellingProducts(topProducts);

        return ResponseEntity.ok(stats);
    }
}
