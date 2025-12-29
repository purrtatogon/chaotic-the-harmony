package com.java.backend.controller;

import com.java.backend.dto.DashboardStatsDTO;
import com.java.backend.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final ProductRepository productRepository;

    public DashboardController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // REAL DATA
        stats.setTotalProducts(productRepository.count());
        stats.setLowStockCount(productRepository.countByStockQuantityLessThan(10)); // Warning threshold: 10 units
        stats.setOutOfStockCount(productRepository.countByStockQuantity(0));

        // MOCK DATA (placeholders until order system is built)
        stats.setTotalSales(new BigDecimal("12450.00"));
        stats.setTotalOrders(152);
        stats.setAverageOrderValue(new BigDecimal("81.90"));

        // MOCK ACTIVITY
        stats.setRecentActivity(Arrays.asList(
                new DashboardStatsDTO.RecentActivityDTO("1", "New order #1001 from Alice", "2 mins ago", "ORDER"),
                new DashboardStatsDTO.RecentActivityDTO("2", "Product 'Fender Strat' stock low", "1 hour ago", "PRODUCT"),
                new DashboardStatsDTO.RecentActivityDTO("3", "New user registered: Bob", "3 hours ago", "USER"),
                new DashboardStatsDTO.RecentActivityDTO("4", "Order #998 delivered", "5 hours ago", "ORDER")
        ));

        return ResponseEntity.ok(stats);
    }
}