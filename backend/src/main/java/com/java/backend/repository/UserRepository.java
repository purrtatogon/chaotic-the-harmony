package com.java.backend.repository;

import com.java.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // method that's critical for Spring Security to load a user by email during login!
    Optional<User> findByEmail(String email);
}
