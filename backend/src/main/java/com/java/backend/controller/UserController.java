package com.java.backend.controller;

import com.java.backend.dto.ChangePasswordRequest;
import com.java.backend.dto.UserUpdateDTO;
import com.java.backend.model.User;
import com.java.backend.model.enums.Role;
import com.java.backend.repository.UserRepository;
import com.java.backend.service.AuditLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Self-service profile/password + staff user admin; list view hides non-customers from non-admins. */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    /** Logged-in shopper or staff — no role check here; SecurityConfig already requires auth. */
    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        return userRepository.findByEmail(currentEmail)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

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

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password is required"));
        }

        String passwordError = AuthController.validatePassword(request.getNewPassword());
        if (passwordError != null) {
            return ResponseEntity.badRequest().body(Map.of("message", passwordError));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        return userRepository.findByEmail(currentEmail)
                .map(user -> {
                    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Current password is incorrect"));
                    }
                    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    userRepository.save(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Non-admin roles only see shoppers; ADMIN gets the whole directory. */
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPORT', 'AUDITOR')")
    @GetMapping
    public List<User> getAllUsers(Authentication authentication) {
        if (isAdmin(authentication)) {
            return userRepository.findAll();
        }
        return userRepository.findAllByRole(Role.CUSTOMER);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPORT', 'AUDITOR')")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id, Authentication authentication) {
        return userRepository.findById(id)
                .filter(user -> isAdmin(authentication) || user.getRole() == Role.CUSTOMER)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        auditLogService.log("USER_CREATED",
                "Created user: " + saved.getFullName(),
                "USER", saved.getId(), resolveCurrentUser());
        return saved;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isSupport = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_SUPPORT".equals(a.getAuthority()));
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        return userRepository.findById(id).map(existingUser -> {
            // Support tweaks customer contact fields only unless an admin overrides.
            if (isSupport && !isAdmin) {
                if (existingUser.getRole() != Role.CUSTOMER) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body((User) null);
                }
                if (userDetails.getFullName() != null) existingUser.setFullName(userDetails.getFullName());
                if (userDetails.getPhoneNumber() != null) existingUser.setPhoneNumber(userDetails.getPhoneNumber());
                if (userDetails.getAddress() != null) existingUser.setAddress(userDetails.getAddress());
            } else {
                if (userDetails.getFullName() != null) existingUser.setFullName(userDetails.getFullName());
                if (userDetails.getEmail() != null) existingUser.setEmail(userDetails.getEmail());
                if (userDetails.getRole() != null) existingUser.setRole(userDetails.getRole());
                if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                    existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                }
            }
            User updated = userRepository.save(existingUser);
            auditLogService.log("USER_UPDATED",
                    "Updated user: " + updated.getFullName(),
                    "USER", id, resolveCurrentUser());
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User current = resolveCurrentUser();
        if (current != null && current.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (userRepository.existsById(id)) {
            String name = userRepository.findById(id).map(User::getFullName).orElse("Unknown");
            userRepository.deleteById(id);
            auditLogService.log("USER_DELETED",
                    "Deleted user: " + name,
                    "USER", id, current);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private static boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private User resolveCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}