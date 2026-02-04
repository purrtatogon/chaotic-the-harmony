package com.java.backend.model.enums;

public enum Role {
    CUSTOMER,           // Formerly CLIENT
    SUPER_ADMIN,        // Full access to settings, users, and financials
    STORE_MANAGER,      // Manage products, prices, and marketing
    WAREHOUSE_STAFF,    // Update stock levels, ship orders
    SUPPORT_AGENT,      // View orders, edit customer profiles
    AUDITOR;            // Read-only access for analytics/finance

    // Helper for safer CSV parsing
    public static Role fromString(String value) {
        if (value == null || value.isEmpty()) return CUSTOMER; // Default fallback

        try {
            return Role.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            // Handle friendly names if they appear in CSV (e.g., "Store Manager" -> STORE_MANAGER)
            String normalized = value.trim().toUpperCase().replace(" ", "_");
            try {
                return Role.valueOf(normalized);
            } catch (IllegalArgumentException ex) {
                System.err.println("Unknown Role '" + value + "'. Defaulting to CUSTOMER.");
                return CUSTOMER;
            }
        }
    }
}
