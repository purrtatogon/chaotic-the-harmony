package com.java.backend.config;

import com.java.backend.model.User;
import com.java.backend.model.enums.Role;
import com.java.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Configuration
public class DatabaseSeeder {

    // Define the constant for the placeholder image URL
    private static final String DEFAULT_PROFILE_IMAGE_URL =
            "https://res.cloudinary.com/dlqadfo7q/image/upload/v1766342168/image_placeholder_square_black_c0ckgb.svg";

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Only seed if the app_user table is empty
            if (userRepository.count() == 0) {

                // Define the demo users
                List<User> dummyUsers = List.of(
                        // Managers
                        new User("Manager One", "manager1@store.com", passwordEncoder.encode("managerpass"), Role.MANAGER, DEFAULT_PROFILE_IMAGE_URL),
                        new User("Manager Two", "manager2@store.com", passwordEncoder.encode("managerpass"), Role.MANAGER, DEFAULT_PROFILE_IMAGE_URL),

                        // Staff
                        new User("Staff One", "staff1@store.com", passwordEncoder.encode("staffpass"), Role.STAFF, DEFAULT_PROFILE_IMAGE_URL),
                        new User("Staff Two", "staff2@store.com", passwordEncoder.encode("staffpass"), Role.STAFF, DEFAULT_PROFILE_IMAGE_URL),

                        // Clients
                        new User("Client One", "client1@store.com", passwordEncoder.encode("clientpass"), Role.CLIENT, DEFAULT_PROFILE_IMAGE_URL),
                        new User("Client Two", "client2@store.com", passwordEncoder.encode("clientpass"), Role.CLIENT, DEFAULT_PROFILE_IMAGE_URL)
                );

                userRepository.saveAll(dummyUsers);
                System.out.println("Seeded 6 dummy users with default profile images into the database.");

            } else {
                System.out.println("Database already contains users. Seeding skipped.");
            }
        };
    }
}