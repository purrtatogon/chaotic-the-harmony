package com.java.backend.repository;

import com.java.backend.model.User;
import com.java.backend.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findAllByRole(Role role);

    @Modifying
    @Query(value = "DELETE FROM app_users WHERE role NOT IN ('CUSTOMER', 'ADMIN', 'MANAGER', 'STAFF', 'SUPPORT', 'AUDITOR')", nativeQuery = true)
    int deleteUsersWithInvalidRoles();
}
