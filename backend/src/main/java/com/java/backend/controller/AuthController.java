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
import java.util.regex.Pattern;

/** Register / login; {@link #validatePassword(String)} is reused by password change endpoint. */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final int PASSWORD_MIN_LENGTH = 12;
    private static final Pattern PASSWORD_UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern PASSWORD_LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern PASSWORD_DIGIT     = Pattern.compile("[0-9]");
    private static final Pattern PASSWORD_SPECIAL   = Pattern.compile("[^A-Za-z0-9]");

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email, request.password)
            );

            UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
            String jwtToken = jwtService.generateToken(userPrincipal);

            String role = userPrincipal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_CUSTOMER");

            return ResponseEntity.ok(Map.of(
                    "token", jwtToken,
                    "role", role,
                    "fullName", userPrincipal.getFullName()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        String passwordError = validatePassword(request.password);
        if (passwordError != null) {
            return ResponseEntity.badRequest().body(Map.of("message", passwordError));
        }

        if (userRepository.findByEmail(request.email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        User newUser = new User();
        newUser.setFullName(request.fullName);
        newUser.setEmail(request.email);
        newUser.setPassword(passwordEncoder.encode(request.password));
        newUser.setRole(Role.CUSTOMER);
        newUser.setProfileImageUrl("https://ui-avatars.com/api/?name=" + request.fullName);

        userRepository.save(newUser);

        String jwtToken = jwtService.generateToken(new UserPrincipal(newUser));
        return ResponseEntity.ok(Map.of("token", jwtToken, "role", "ROLE_CUSTOMER"));
    }

    /** Used by registration and password change endpoints on {@link UserController}. */
    public static String validatePassword(String password) {
        if (password == null || password.length() < PASSWORD_MIN_LENGTH) {
            return "Password must be at least " + PASSWORD_MIN_LENGTH + " characters.";
        }
        if (!PASSWORD_UPPERCASE.matcher(password).find()) {
            return "Password must contain at least one uppercase letter.";
        }
        if (!PASSWORD_LOWERCASE.matcher(password).find()) {
            return "Password must contain at least one lowercase letter.";
        }
        if (!PASSWORD_DIGIT.matcher(password).find()) {
            return "Password must contain at least one number.";
        }
        if (!PASSWORD_SPECIAL.matcher(password).find()) {
            return "Password must contain at least one special character.";
        }
        return null;
    }

    public record LoginRequest(String email, String password) {}
    public record RegisterRequest(String fullName, String email, String password) {}
}
