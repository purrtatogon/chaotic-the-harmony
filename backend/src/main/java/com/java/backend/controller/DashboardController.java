package com.java.backend.controller;

import com.java.backend.dto.DashboardStatsDTO;
import com.java.backend.model.Order;
import com.java.backend.model.OrderItem;
import com.java.backend.model.User;
import com.java.backend.model.enums.Role;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final ProductRepository productRepository;
    private final ProductInventoryRepository productInventoryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public DashboardController(ProductRepository productRepository, 
                               ProductInventoryRepository productInventoryRepository,
                               OrderRepository orderRepository,
                               UserRepository userRepository) {
        this.productRepository = productRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // 1. PRODUCT STATS
        stats.setTotalProducts(productRepository.count());
        stats.setLowStockCount(productInventoryRepository.countByStockQuantityLessThan(10));
        stats.setOutOfStockCount(productInventoryRepository.countByStockQuantity(0));

        // 2. ORDER STATS
        List<Order> allOrders = orderRepository.findAll();
        stats.setTotalOrders((int) allOrders.size());

        BigDecimal totalSales = allOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalSales(totalSales.setScale(2, RoundingMode.HALF_UP));

        if (stats.getTotalOrders() > 0) {
            BigDecimal avgValue = totalSales.divide(BigDecimal.valueOf(stats.getTotalOrders()), 2, RoundingMode.HALF_UP);
            stats.setAverageOrderValue(avgValue);
        } else {
            stats.setAverageOrderValue(BigDecimal.ZERO);
        }

        // 3. RECENT ACTIVITY (REAL) - Only Orders and Customer registrations
        List<DashboardStatsDTO.RecentActivityDTO> activities = new ArrayList<>();
        
        // Get 5 most recent orders
        allOrders.stream()
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
                .limit(5)
                .forEach(order -> {
                    activities.add(new DashboardStatsDTO.RecentActivityDTO(
                            "ORD-" + order.getId(),
                            "Order #" + order.getId() + " placed by " + (order.getCustomer() != null ? order.getCustomer().getFullName() : "Unknown"),
                            "Recent",
                            "ORDER"
                    ));
                });

        // Add customer registrations only (filter by CUSTOMER role)
        userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.CUSTOMER)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(3)
                .forEach(user -> {
                    activities.add(new DashboardStatsDTO.RecentActivityDTO(
                            "USR-" + user.getId(),
                            "Customer registered: " + user.getFullName(),
                            "New",
                            "USER"
                    ));
                });

        stats.setRecentActivity(activities);

        // 4. TOP SELLING PRODUCTS (REAL)
        Map<String, Long> productSales = new HashMap<>();
        Map<String, BigDecimal> productRevenue = new HashMap<>();

        for (Order order : allOrders) {
            for (OrderItem item : order.getItems()) {
                String productName = item.getVariant().getProduct().getName();
                productSales.put(productName, productSales.getOrDefault(productName, 0L) + item.getQuantity());
                
                BigDecimal itemRevenue = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
                productRevenue.put(productName, productRevenue.getOrDefault(productName, BigDecimal.ZERO).add(itemRevenue));
            }
        }

        List<DashboardStatsDTO.TopProductDTO> topProducts = productSales.entrySet().stream()
                .map(entry -> new DashboardStatsDTO.TopProductDTO(
                        entry.getKey(),
                        entry.getValue(),
                        productRevenue.get(entry.getKey()).setScale(2, RoundingMode.HALF_UP)
                ))
                .sorted((a, b) -> Long.compare(b.getSold(), a.getSold()))
                .limit(5)
                .collect(Collectors.toList());

        stats.setTopSellingProducts(topProducts);

        return ResponseEntity.ok(stats);
    }
}
