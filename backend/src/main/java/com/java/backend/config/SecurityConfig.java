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

    // Access Rules and CORS
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // PUBLIC READ-ONLY ACCESS (Storefront)
                        .requestMatchers(HttpMethod.GET, "/api/v1/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()

                        // AUTHENTICATION ENDPOINTS (Login/Register)
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // TEMPORARY OPEN ACCESS (For Development/Frontend Testing)
                        .requestMatchers("/api/v1/dashboard/**").permitAll()
                        .requestMatchers("/api/v1/categories/**").permitAll() // Categories must be open for your dropdown to work

                        // Note: Since we have specific GET rules for products above,
                        // this covers POST/PUT/DELETE for products if we want them open for now:
                        .requestMatchers("/api/v1/products/**").permitAll()

                        // RESTRICTED ENDPOINTS (Must come BEFORE anyRequest)

                        // User Management (CRUD) - ONLY MANAGER
                        // TEMPORARILY ALLOW USER ACCESS until implementing the JWT Filter logic.
                        // .hasAuthority("MANAGER")
                        .requestMatchers("/api/v1/users/**").permitAll()

                        // Category CRUD - Locked to MANAGER (Currently commented out to allow open access above)
                        // .requestMatchers("/api/v1/categories/**").hasAuthority("MANAGER")

                        // CATCH-ALL (must be the VERY LAST line)
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // Define the CORS configuration to allow React to connect
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

    // Define UserDetailsService (The "User Repo Bean")
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    // Expose AuthenticationManager (needed for login controller)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}