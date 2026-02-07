package com.java.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsDTO {
    // Inventory Stats (Real)
    private long totalProducts;
    private long lowStockCount;
    private long outOfStockCount;

    // Sales Stats (Mocked for now)
    private BigDecimal totalSales;
    private BigDecimal averageOrderValue;
    private int totalOrders;

    // Recent Activity (Mocked for now)
    private List<RecentActivityDTO> recentActivity;

    private List<TopProductDTO> topSellingProducts;

    // Constructors, Getters, Setters
    public DashboardStatsDTO() {}

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public long getOutOfStockCount() { return outOfStockCount; }
    public void setOutOfStockCount(long outOfStockCount) { this.outOfStockCount = outOfStockCount; }

    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public BigDecimal getAverageOrderValue() { return averageOrderValue; }
    public void setAverageOrderValue(BigDecimal averageOrderValue) { this.averageOrderValue = averageOrderValue; }

    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }

    public List<RecentActivityDTO> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<RecentActivityDTO> recentActivity) { this.recentActivity = recentActivity; }

    public List<TopProductDTO> getTopSellingProducts() { return topSellingProducts; }
    public void setTopSellingProducts(List<TopProductDTO> topSellingProducts) { this.topSellingProducts = topSellingProducts; }

    // Inner DTO for Activity List
    public static class RecentActivityDTO {
        private String id;
        private String description;
        private String time;
        private String type; // "ORDER", "USER", "PRODUCT"

        public RecentActivityDTO(String id, String description, String time, String type) {
            this.id = id;
            this.description = description;
            this.time = time;
            this.type = type;
        }
        // Getters...
        public String getId() { return id; }
        public String getDescription() { return description; }
        public String getTime() { return time; }
        public String getType() { return type; }
    }

    public static class TopProductDTO {
        private String name;
        private long sold;
        private BigDecimal revenue;

        public TopProductDTO(String name, long sold, BigDecimal revenue) {
            this.name = name;
            this.sold = sold;
            this.revenue = revenue;
        }

        public String getName() { return name; }
        public long getSold() { return sold; }
        public BigDecimal getRevenue() { return revenue; }
    }
}