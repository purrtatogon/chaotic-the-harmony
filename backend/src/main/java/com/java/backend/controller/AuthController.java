package com.java.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.springframework.web.bind.annotation.RestController; // <--- CRITICAL
import org.springframework.web.bind.annotation.RequestMapping; // <--- CRITICAL

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. Attempt to authenticate the user (uses UserDetailsService and PasswordEncoder)
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email, request.password)
            );

            // 2. If authentication succeeds, get the role and return a dummy token/info
            // NOTE: I'm using a dummy token/role for initial testing.
            String role = auth.getAuthorities().stream().findFirst().orElseThrow().getAuthority();

            return ResponseEntity.ok(Map.of(
                    "token", "DUMMY_TOKEN_FOR_TESTING_ONLY",
                    "role", role
            ));
        } catch (Exception e) {
            // this will catche BadCredentialsException and other authentication failures
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
        }
    }

    // Small DTO for the request body
    public record LoginRequest(String email, String password) {}
}