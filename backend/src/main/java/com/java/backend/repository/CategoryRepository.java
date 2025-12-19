package com.java.backend.repository;

import com.java.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Find a Category by its 3-letter code
    Optional<Category> findByCode(String code);

    // Find a Category by its name
    Optional<Category> findByName(String name);
}
