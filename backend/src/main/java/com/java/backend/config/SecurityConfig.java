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
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // Let OPTIONS through first, or the browser shows a CORS error instead of 401.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/api/v1/auth/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/site-content/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/profile").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/password").authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/v1/users").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "AUDITOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/*").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "AUDITOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/users").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/*").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/*").hasAnyRole("SUPER_ADMIN", "SUPPORT_AGENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/products/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/products/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER", "WAREHOUSE_STAFF")

                        .requestMatchers("/api/v1/categories/**").hasAnyRole("SUPER_ADMIN", "STORE_MANAGER")

                        .requestMatchers("/api/v1/users/**").authenticated()

                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:8080",
                "https://chaotic-the-harmony-web.azurewebsites.net"
        ));

        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // * = any request header. Must pair with allowCredentials false (JWT is in Authorization, not cookies).
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}