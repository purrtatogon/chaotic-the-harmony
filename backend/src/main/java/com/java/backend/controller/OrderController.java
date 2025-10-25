package com.java.backend.controller;

import com.java.backend.model.Order;
import com.java.backend.model.User;
import com.java.backend.repository.OrderRepository;
import com.java.backend.repository.UserRepository;
import com.java.backend.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Order listing + PATCH status with a boring state machine gate. */
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private static final Map<String, Set<String>> VALID_TRANSITIONS = Map.of(
            // Lightweight workflow — tweak here if statuses grow.
            "PROCESSING", Set.of("SHIPPED", "CANCELLED"),
            "SHIPPED",    Set.of("DELIVERED", "CANCELLED")
    );

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public OrderController(OrderRepository orderRepository, UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAllWithItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{userId}")
    public List<Order> getOrdersByCustomer(@PathVariable Long userId) {
        return orderRepository.findAllByCustomerIdWithItems(userId);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) {

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing 'status' field."));
        }
        newStatus = newStatus.trim().toUpperCase();

        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        String currentStatus = order.getStatus();
        Set<String> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Cannot transition from " + currentStatus + " to " + newStatus + "."
            ));
        }

        order.setStatus(newStatus);

        if ("SHIPPED".equals(newStatus) && order.getShippedAt() == null) {
            order.setShippedAt(LocalDateTime.now());
        }
        if ("DELIVERED".equals(newStatus)) {
            if (order.getShippedAt() == null) {
                order.setShippedAt(LocalDateTime.now());
            }
            if (order.getDeliveredAt() == null) {
                order.setDeliveredAt(LocalDateTime.now());
            }
        }

        User staffUser = userRepository.findByEmail(principal.getUsername()).orElse(null);
        if (staffUser != null) {
            order.setUpdatedBy(staffUser);
        }

        orderRepository.save(order);

        auditLogService.log("ORDER_STATUS_UPDATED",
                "Updated Order #" + id + " to " + newStatus,
                "ORDER", id, staffUser);

        return ResponseEntity.ok(order);
    }
}
