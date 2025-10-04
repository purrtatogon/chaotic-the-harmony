package com.java.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsDTO {
    // Inventory stats
    private long totalProducts;
    private long lowStockCount;
    private long outOfStockCount;

    // Lifetime sales stats
    private BigDecimal totalSales;
    private BigDecimal averageOrderValue;
    private int totalOrders;

    // Time-scoped pulse metrics
    private int ordersToday;
    private BigDecimal revenueThisMonth;
    private int pendingOrders;
    private int newCustomersThisMonth;
    private int totalCustomers;

    private List<RecentActivityDTO> recentActivity;
    private List<TopProductDTO> topSellingProducts;

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

    public int getOrdersToday() { return ordersToday; }
    public void setOrdersToday(int ordersToday) { this.ordersToday = ordersToday; }

    public BigDecimal getRevenueThisMonth() { return revenueThisMonth; }
    public void setRevenueThisMonth(BigDecimal revenueThisMonth) { this.revenueThisMonth = revenueThisMonth; }

    public int getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(int pendingOrders) { this.pendingOrders = pendingOrders; }

    public int getNewCustomersThisMonth() { return newCustomersThisMonth; }
    public void setNewCustomersThisMonth(int newCustomersThisMonth) { this.newCustomersThisMonth = newCustomersThisMonth; }

    public int getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(int totalCustomers) { this.totalCustomers = totalCustomers; }

    public List<RecentActivityDTO> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<RecentActivityDTO> recentActivity) { this.recentActivity = recentActivity; }

    public List<TopProductDTO> getTopSellingProducts() { return topSellingProducts; }
    public void setTopSellingProducts(List<TopProductDTO> topSellingProducts) { this.topSellingProducts = topSellingProducts; }

    public static class RecentActivityDTO {
        private String id;
        private String description;
        private String time;
        private String type;

        public RecentActivityDTO(String id, String description, String time, String type) {
            this.id = id;
            this.description = description;
            this.time = time;
            this.type = type;
        }

        public String getId() { return id; }
        public String getDescription() { return description; }
        public String getTime() { return time; }
        public String getType() { return type; }
    }

    public static class TopProductDTO {
        private Long productId;
        private String name;
        private long sold;
        private BigDecimal revenue;
        private BigDecimal unitPrice;

        public TopProductDTO(Long productId, String name, long sold,
                             BigDecimal revenue, BigDecimal unitPrice) {
            this.productId = productId;
            this.name = name;
            this.sold = sold;
            this.revenue = revenue;
            this.unitPrice = unitPrice;
        }

        public Long getProductId() { return productId; }
        public String getName() { return name; }
        public long getSold() { return sold; }
        public BigDecimal getRevenue() { return revenue; }
        public BigDecimal getUnitPrice() { return unitPrice; }
    }
}
