package com.java.backend.controller;

import com.java.backend.model.UserPrincipal; // Required to cast the principal
import com.java.backend.service.JwtService;   // Required to generate real tokens
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService; // <--- 1. Inject the Token Service

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. Attempt to authenticate the user
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email, request.password)
            );

            // 2. Get the User Object (Principal)
            UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();

            // 3. GENERATE THE REAL TOKEN (The "Passport")
            // This generates the signed JWT string containing the user's email
            String jwtToken = jwtService.generateToken(userPrincipal);

            // 4. Get Role
            String role = userPrincipal.getAuthorities().stream().findFirst().orElseThrow().getAuthority();

            return ResponseEntity.ok(Map.of(
                    "token", jwtToken,
                    "role", role
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
        }
    }

    public record LoginRequest(String email, String password) {}
}