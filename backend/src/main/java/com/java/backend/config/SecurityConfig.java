package com.java.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;


    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // 1. PUBLIC ENDPOINTS
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // 2. USER PROFILE (Authenticated Users)
                        // This allows Customers, Staff, Admins to see their own profile
                        .requestMatchers("/api/v1/users/me").authenticated()

                        // 3. PRODUCTS
                        // Everyone (except Customers) can VIEW products
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER", "WAREHOUSE_STAFF", "SUPPORT_AGENT", "AUDITOR")
                        // Only Admins & Managers can CREATE/DELETE products
                        .requestMatchers(HttpMethod.POST, "/api/v1/products/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER")
                        // Warehouse & Managers can UPDATE (e.g. stock levels)
                        .requestMatchers(HttpMethod.PUT, "/api/v1/products/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER", "WAREHOUSE_STAFF")

                        // 4. CATEGORIES
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER", "WAREHOUSE_STAFF", "SUPPORT_AGENT", "AUDITOR")
                        .requestMatchers("/api/v1/categories/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER")

                        // 5. USER MANAGEMENT (Strictly Admin)
                        // Note: The /users/me endpoint above takes precedence over this because it's defined earlier
                        .requestMatchers("/api/v1/users/**").hasAnyRole("SUPER_ADMIN")

                        // 6. CATCH-ALL
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Allow Frontend
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}