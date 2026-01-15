package com.java.backend.config;

import com.java.backend.model.User;
import com.java.backend.model.enums.Role;
import com.java.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@Order(1)  // This ensures it runs before Products
public class UserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Inject dependencies via Constructor
    public UserSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only seed if the user table is empty
        if (userRepository.count() == 0) {

            List<User> users = new ArrayList<>();

                // SUPER ADMINS (Executives/IT)
                users.addAll(Arrays.asList(
                        new User("Eleanor Douglas", "eleanor.douglas@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPER_ADMIN),
                        new User("Liam Almeida", "liam.almeida@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPER_ADMIN),
                        new User("Sarah Connor", "sarah.connor@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPER_ADMIN),
                        new User("David Bowman", "david.bowman@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPER_ADMIN),
                        new User("Ellen Ripley", "ellen.ripley@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPER_ADMIN),
                        new User("Thomas Anderson", "neo@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPER_ADMIN),
                        new User("Diana Prince", "diana.prince@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPER_ADMIN)
                ));

                // STORE MANAGERS (Sales & Catalog)
                users.addAll(Arrays.asList(
                        new User("Michael Scott", "m.scott@cth-store.com", passwordEncoder.encode("pass123"), Role.STORE_MANAGER),
                        new User("Leslie Knope", "l.knope@cth-store.com", passwordEncoder.encode("pass123"), Role.STORE_MANAGER),
                        new User("Jack Donaghy", "j.donaghy@cth-store.com", passwordEncoder.encode("pass123"), Role.STORE_MANAGER),
                        new User("Liz Lemon", "l.lemon@cth-store.com", passwordEncoder.encode("pass123"), Role.STORE_MANAGER),
                        new User("Ron Swanson", "r.swanson@cth-store.com", passwordEncoder.encode("pass123"), Role.STORE_MANAGER),
                        new User("Olivia Pope", "o.pope@cth-store.com", passwordEncoder.encode("pass123"), Role.STORE_MANAGER),
                        new User("Don Draper", "d.draper@cth-store.com", passwordEncoder.encode("pass123"), Role.STORE_MANAGER)
                ));

                // WAREHOUSE STAFF (Fulfillment)
                users.addAll(Arrays.asList(
                        new User("Darryl Philbin", "darryl.p@cth-store.com", passwordEncoder.encode("pass123"), Role.WAREHOUSE_STAFF),
                        new User("Roy Anderson", "roy.a@cth-store.com", passwordEncoder.encode("pass123"), Role.WAREHOUSE_STAFF),
                        new User("Val Logistics", "val.logistics@cth-store.com", passwordEncoder.encode("pass123"), Role.WAREHOUSE_STAFF),
                        new User("Hodor Stark", "hodor@cth-store.com", passwordEncoder.encode("pass123"), Role.WAREHOUSE_STAFF),
                        new User("Mike Ehrmantraut", "mike.e@cth-store.com", passwordEncoder.encode("pass123"), Role.WAREHOUSE_STAFF),
                        new User("Amos Burton", "amos.b@cth-store.com", passwordEncoder.encode("pass123"), Role.WAREHOUSE_STAFF),
                        new User("Chewbacca", "chewie@cth-store.com", passwordEncoder.encode("pass123"), Role.WAREHOUSE_STAFF)
                ));

                // SUPPORT AGENTS (Helpdesk)
                users.addAll(Arrays.asList(
                        new User("Pam Beesly", "pam.b@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPPORT_AGENT),
                        new User("Jim Halpert", "jim.h@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPPORT_AGENT),
                        new User("Erin Hannon", "erin.h@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPPORT_AGENT),
                        new User("Kenneth Parcell", "kenneth.p@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPPORT_AGENT),
                        new User("April Ludgate", "april.l@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPPORT_AGENT),
                        new User("Tom Haverford", "tom.h@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPPORT_AGENT),
                        new User("Donna Meagle", "donna.m@cth-store.com", passwordEncoder.encode("pass123"), Role.SUPPORT_AGENT)
                ));

                // AUDITORS (Finance/Viewers)
                users.addAll(Arrays.asList(
                        new User("Oscar Martinez", "oscar.m@cth-store.com", passwordEncoder.encode("pass123"), Role.AUDITOR),
                        new User("Angela Martin", "angela.m@cth-store.com", passwordEncoder.encode("pass123"), Role.AUDITOR),
                        new User("Kevin Malone", "kevin.m@cth-store.com", passwordEncoder.encode("pass123"), Role.AUDITOR),
                        new User("Ben Wyatt", "ben.w@cth-store.com", passwordEncoder.encode("pass123"), Role.AUDITOR),
                        new User("Chris Traeger", "chris.t@cth-store.com", passwordEncoder.encode("pass123"), Role.AUDITOR),
                        new User("Skyler White", "skyler.w@cth-store.com", passwordEncoder.encode("pass123"), Role.AUDITOR),
                        new User("Saul Goodman", "saul.g@cth-store.com", passwordEncoder.encode("pass123"), Role.AUDITOR)
                ));

                // CUSTOMERS (End Users)
                users.addAll(Arrays.asList(
                        new User("Alice Wonderland", "alice.w@gmail.com", passwordEncoder.encode("pass123"), Role.CUSTOMER),
                        new User("Bob Builder", "bob.builds@hotmail.com", passwordEncoder.encode("pass123"), Role.CUSTOMER),
                        new User("Charlie Bucket", "charlie.choco@gmail.com", passwordEncoder.encode("pass123"), Role.CUSTOMER),
                        new User("Dora Explorer", "dora.maps@yahoo.com", passwordEncoder.encode("pass123"), Role.CUSTOMER),
                        new User("Eve Polastri", "eve.spy@protonmail.com", passwordEncoder.encode("pass123"), Role.CUSTOMER),
                        new User("Frank Castle", "frank.c@gmail.com", passwordEncoder.encode("pass123"), Role.CUSTOMER),
                        new User("Grace Hopper", "grace.code@gmail.com", passwordEncoder.encode("pass123"), Role.CUSTOMER)
                ));

                userRepository.saveAll(users);
                System.out.println("Seeded " + users.size() + " users into the database with specific roles and avatars.");

            } else {
                System.out.println("Database already contains users. Seeding skipped.");
            }
        }
    }