package com.java.backend.controller;

import com.java.backend.dto.ChangePasswordRequest;
import com.java.backend.dto.UserUpdateDTO;
import com.java.backend.model.User;
import com.java.backend.model.enums.Role;
import com.java.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // PUBLIC / SHARED ENDPOINTS

    // Get My Profile (Available to any logged-in user)
    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        return userRepository.findByEmail(currentEmail)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update My Profile (Available to any logged-in user)
    @PutMapping("/profile")
    public ResponseEntity<User> updateMyProfile(@RequestBody UserUpdateDTO updateData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        return userRepository.findByEmail(currentEmail)
                .map(existingUser -> {
                    if (updateData.getFullName() != null) existingUser.setFullName(updateData.getFullName());
                    if (updateData.getPhoneNumber() != null) existingUser.setPhoneNumber(updateData.getPhoneNumber());
                    if (updateData.getAddress() != null) existingUser.setAddress(updateData.getAddress());

                    return ResponseEntity.ok(userRepository.save(existingUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Change own password (any authenticated user)
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "New password is required"));
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        return userRepository.findByEmail(currentEmail)
                .map(user -> {
                    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Current password is incorrect"));
                    }
                    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    userRepository.save(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ---------- ROLE-BASED USER MANAGEMENT ----------
    // List/View: SUPER_ADMIN, STORE_MANAGER, SUPPORT_AGENT, AUDITOR
    // Create/Delete: SUPER_ADMIN only
    // Update: SUPER_ADMIN (any user), SUPPORT_AGENT (customers only, profile fields)

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SUPPORT_AGENT', 'AUDITOR')")
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER', 'SUPPORT_AGENT', 'AUDITOR')")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT_AGENT')")
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isSupportAgent = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_SUPPORT_AGENT".equals(a.getAuthority()));
        boolean isSuperAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_SUPER_ADMIN".equals(a.getAuthority()));

        return userRepository.findById(id).map(existingUser -> {
            if (isSupportAgent && !isSuperAdmin) {
                // SUPPORT_AGENT may only edit customers; only profile fields (no role/email/password)
                if (existingUser.getRole() != Role.CUSTOMER) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body((User) null);
                }
                if (userDetails.getFullName() != null) existingUser.setFullName(userDetails.getFullName());
                if (userDetails.getPhoneNumber() != null) existingUser.setPhoneNumber(userDetails.getPhoneNumber());
                if (userDetails.getAddress() != null) existingUser.setAddress(userDetails.getAddress());
            } else {
                // SUPER_ADMIN: full update
                if (userDetails.getFullName() != null) existingUser.setFullName(userDetails.getFullName());
                if (userDetails.getEmail() != null) existingUser.setEmail(userDetails.getEmail());
                if (userDetails.getRole() != null) existingUser.setRole(userDetails.getRole());
                if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                    existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                }
            }
            return ResponseEntity.ok(userRepository.save(existingUser));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        // Prevent deleting yourself
        User current = userRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElse(null);
        if (current != null && current.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}