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

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Only seed if the app_user table is empty
            if (userRepository.count() == 0) {

                // Define the demo users
                List<User> dummyUsers = List.of(
                        // Managers
                        new User("Manager One", "manager1@store.com", passwordEncoder.encode("managerpass"), Role.MANAGER),
                        new User("Manager Two", "manager2@store.com", passwordEncoder.encode("managerpass"), Role.MANAGER),

                        // Staff
                        new User("Staff One", "staff1@store.com", passwordEncoder.encode("staffpass"), Role.STAFF),
                        new User("Staff Two", "staff2@store.com", passwordEncoder.encode("staffpass"), Role.STAFF),

                        // Clients
                        new User("Client One", "client1@store.com", passwordEncoder.encode("clientpass"), Role.CLIENT),
                        new User("Client Two", "client2@store.com", passwordEncoder.encode("clientpass"), Role.CLIENT)
                );

                userRepository.saveAll(dummyUsers);
                System.out.println("Seeded 6 dummy users into the database.");

            } else {
                System.out.println("Database already contains users. Seeding skipped.");
            }
        };
    }
}
