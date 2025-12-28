package com.java.backend.controller;

import com.java.backend.model.User;
import com.java.backend.repository.UserRepository;
import com.java.backend.dto.UserUpdateDTO;
import org.springframework.http.ResponseEntity;
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

    // FETCH CURRENT LOGGED-IN PROFILE
    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        return userRepository.findByEmail(currentEmail)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🆕 NEW METHOD: UPDATE OWN PROFILE (Uses DTO)
    @PutMapping("/profile")
    public ResponseEntity<User> updateMyProfile(@RequestBody UserUpdateDTO updateData) {
        // 1. Get the currently logged-in user's email
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        return userRepository.findByEmail(currentEmail)
                .map(existingUser -> {
                    // 2. Update ONLY the fields present in the DTO
                    // This prevents overwriting the Password or Role with null

                    if (updateData.getFullName() != null) {
                        existingUser.setFullName(updateData.getFullName());
                    }
                    if (updateData.getPhoneNumber() != null) {
                        existingUser.setPhoneNumber(updateData.getPhoneNumber());
                    }
                    if (updateData.getAddress() != null) {
                        existingUser.setAddress(updateData.getAddress());
                    }
                    // Note: Your User.java didn't show a 'department' field.
                    // If you added it to User.java, uncomment the line below:
                    // if (updateData.getDepartment() != null) existingUser.setDepartment(updateData.getDepartment());

                    if (updateData.getProfileImageUrl() != null) {
                        existingUser.setProfileImageUrl(updateData.getProfileImageUrl());
                    }

                    // 3. Save the merged user back to DB
                    return ResponseEntity.ok(userRepository.save(existingUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ADMIN: GET ALL USERS
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ADMIN: GET USER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ADMIN: CREATE USER
    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // ADMIN: UPDATE OTHER USER (BY ID)
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(existingUser -> {

            // Update basic fields
            if (userDetails.getFullName() != null) existingUser.setFullName(userDetails.getFullName());
            if (userDetails.getEmail() != null) existingUser.setEmail(userDetails.getEmail());
            if (userDetails.getRole() != null) existingUser.setRole(userDetails.getRole());

            // LINE TO SAVE THE IMAGE
            if (userDetails.getProfileImageUrl() != null) {
                existingUser.setProfileImageUrl(userDetails.getProfileImageUrl());
            }

            // Update password only if provided
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }

            return ResponseEntity.ok(userRepository.save(existingUser));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ADMIN: DELETE USER
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}