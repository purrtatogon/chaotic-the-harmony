package com.java.backend.config;

import org.springframework.beans.factory.annotation.Value;
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

import java.util.Arrays;
import java.util.List;

/** Stateless JWT + CORS; rule order matters — specific matchers before anyRequest(). */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final List<String> allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthFilter,
            @Value("${app.cors.allowed-origins}") String allowedOriginsRaw
    ) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.allowedOrigins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
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
                        // Let OPTIONS through first, or the browser shows a CORS error instead of 401.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/api/v1/auth/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/site-content/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/site-content/*")
                                .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.GET, "/api/v1/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/profile").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/password").authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/v1/users").hasAnyRole("ADMIN", "MANAGER", "SUPPORT", "AUDITOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/*").hasAnyRole("ADMIN", "MANAGER", "SUPPORT", "AUDITOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/*").hasAnyRole("ADMIN", "SUPPORT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/products/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/products/**").hasAnyRole("ADMIN", "MANAGER", "STAFF")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/products/variants/*/stock")
                                .hasAnyRole("ADMIN", "MANAGER", "STAFF")

                        .requestMatchers("/api/v1/categories/**").hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/orders/*/status")
                                .hasAnyRole("ADMIN", "MANAGER", "SUPPORT", "STAFF")

                        .requestMatchers("/api/v1/users/**").authenticated()

                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // With credentials, browsers require an explicit header allow-list (not "*").
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
