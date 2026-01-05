package com.java.backend.model.enums;

public enum Role {
    CUSTOMER,           // Formerly CLIENT
    SUPER_ADMIN,        // Full access to settings, users, and financials
    STORE_MANAGER,      // Manage products, prices, and marketing
    WAREHOUSE_STAFF,    // Update stock levels, ship orders
    SUPPORT_AGENT,      // View orders, edit customer profiles
    AUDITOR             // Read-only access for analytics/finance
}
