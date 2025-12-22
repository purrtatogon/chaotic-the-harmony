package com.java.backend.config;

import com.java.backend.model.UserPrincipal;
import com.java.backend.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity // Enables Spring Security's web support
public class SecurityConfig {

    private final UserRepository userRepository;

    // Constructor Injection for the UserRepository
    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Password Encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Access Rules and CORS - telling Spring Security to ignore the security checks temporarily for the API endpoints I want to access
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // allowing public access to storefront data
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()

                        // allowing public/unsecured endpoints (login/auth and frontend routes)
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // TEMPORARY OPEN ACCESS FOR FRONTEND TESTING: changing these lines to permitAll() so the API calls go through.

                        // Dashboard
                        .requestMatchers("/api/v1/dashboard/**").permitAll() // TEMPORARILY OPEN

                        // product/inventory management
                        .requestMatchers("/api/v1/products/**").permitAll() // TEMPORARILY OPEN

                        // ADMIN ENDPOINT RULES

                        // User Management (CRUD) - ONLY MANAGER (STILL LOCKED)
                        .requestMatchers("/api/v1/users/**").hasAuthority("MANAGER")

                        // Category CRUD - ONLY MANAGER (STILL LOCKED)
                        .requestMatchers("/api/v1/categories/**").hasAuthority("MANAGER")


                        // Deny all other requests by default (fail-safe)
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // 2. Define the CORS configuration to allow React to connect
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Adjust this if your frontend port changes
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // --- 3. Define UserDetailsService (How to load User data) ---
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    // --- 4. Expose AuthenticationManager (Needed for Login Controller) ---
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}