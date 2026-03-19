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
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/profile").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/password").authenticated()

                        // 2b. USER MANAGEMENT (Role-based)
                        // List & view: SUPER_ADMIN, STORE_MANAGER, SUPPORT_AGENT, AUDITOR
                        .requestMatchers(HttpMethod.GET, "/api/v1/users").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "AUDITOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/*").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "AUDITOR")
                        // Create & delete: SUPER_ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/v1/users").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/*").hasRole("SUPER_ADMIN")
                        // Update: SUPER_ADMIN or SUPPORT_AGENT (controller restricts SUPPORT_AGENT to customers)
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/*").hasAnyRole("SUPER_ADMIN", "SUPPORT_AGENT")

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

                        // 5. USER MANAGEMENT (remaining /users/** must be authenticated; controller @PreAuthorize refines)
                        .requestMatchers("/api/v1/users/**").authenticated()

                        // 6. CATCH-ALL
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // ALLOW BOTH LOCAL AND AZURE
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://chaotic-the-harmony-web.azurewebsites.net"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}