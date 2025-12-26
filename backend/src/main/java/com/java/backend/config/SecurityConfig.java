package com.java.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                .authorizeHttpRequests(auth -> auth
                        // THE ONLY PUBLIC ENDPOINT
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/users/me").authenticated()

                        // PRODUCTS: Viewable by everyone (Staff/Manager/Admin),
                        // CRUD by everyone (Staff/Manager/Admin)
                        .requestMatchers("/api/v1/products/**").hasAnyAuthority("ADMIN", "MANAGER", "STAFF")

                        // CATEGORIES: Viewable by everyone (Staff/Manager/Admin),
                        // BUT: Creation/Update/Deletion ONLY by ADMIN or MANAGER
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").hasAnyAuthority("ADMIN", "MANAGER", "STAFF")
                        .requestMatchers("/api/v1/categories/**").hasAnyAuthority("ADMIN", "MANAGER")

                        // USERS & DASHBOARD: Strictly higher-level access
                        .requestMatchers("/api/v1/users/**").hasAnyAuthority("ADMIN", "MANAGER")
                        .requestMatchers("/api/v1/dashboard/**").hasAnyAuthority("ADMIN", "MANAGER", "STAFF")

                        // CATCH-ALL: Lock everything else down
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}