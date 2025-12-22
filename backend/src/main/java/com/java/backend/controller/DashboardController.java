package com.java.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

// This provides dummy data for my frontend and allows me to test the MANAGER/STAFF access rule.

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @GetMapping("/stats")
    public ResponseEntity<List<Map<String, Object>>> getStats() {
        // This endpoint requires MANAGER or STAFF authority (as per SecurityConfig)
        return ResponseEntity.ok(List.of(
                Map.of("label", "Total Revenue", "value", "€12,450.99"),
                Map.of("label", "Orders", "value", "154"),
                Map.of("label", "Low Stock Items", "value", "3")
        ));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<Map<String, String>>> getActivity() {
        // This endpoint requires MANAGER or STAFF authority (as per SecurityConfig)
        return ResponseEntity.ok(List.of(
                Map.of("action", "New Order", "item", "#1001", "user", "Client One", "date", "2 mins ago"),
                Map.of("action", "Stock Update", "item", "Band T-Shirt", "user", "Manager One", "date", "1 hour ago")
        ));
    }
}