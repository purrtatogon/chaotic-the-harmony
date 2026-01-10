package com.java.backend.controller;

import com.java.backend.model.User;
import com.java.backend.model.UserPrincipal;
import com.java.backend.model.enums.Role;
import com.java.backend.repository.UserRepository;
import com.java.backend.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository; // Added for Registration
    private final PasswordEncoder passwordEncoder; // Added for Registration

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. Attempt authentication
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email, request.password)
            );

            // 2. Extract User Principal
            UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();

            // 3. Generate Token
            String jwtToken = jwtService.generateToken(userPrincipal);

            // 4. Extract Role (Safe check)
            String role = userPrincipal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_CUSTOMER"); // Default fallback

            // 5. Return success response
            return ResponseEntity.ok(Map.of(
                    "token", jwtToken,
                    "role", role,
                    "fullName", userPrincipal.getFullName() // <--- Access the name here
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    // REGISTER ENDPOINT
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        User newUser = new User();
        newUser.setFullName(request.fullName);
        newUser.setEmail(request.email);
        newUser.setPassword(passwordEncoder.encode(request.password)); // This hashes the password!
        newUser.setRole(Role.CUSTOMER); // Default to Customer
        newUser.setProfileImageUrl("https://ui-avatars.com/api/?name=" + request.fullName);

        userRepository.save(newUser);

        // Auto-login after register (optional, or just return success)
        String jwtToken = jwtService.generateToken(new UserPrincipal(newUser));
        return ResponseEntity.ok(Map.of("token", jwtToken, "role", "ROLE_CUSTOMER"));
    }

    // DTO Records
    public record LoginRequest(String email, String password) {}
    public record RegisterRequest(String fullName, String email, String password) {}
}