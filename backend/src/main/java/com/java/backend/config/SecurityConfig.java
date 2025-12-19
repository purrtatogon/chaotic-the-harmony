package com.java.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    // this defines the PasswordEncoder bean for the entire app
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt is the standard algorithm for password hashing
        return new BCryptPasswordEncoder();
    }
}
