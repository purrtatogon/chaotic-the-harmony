package com.java.backend.model;

import jakarta.persistence.*;
import org.springframework.data.domain.Persistable;

/**
 * Base Entity class for all JPA entities in the application.
 * <p>
 * <strong>Architecture Note:</strong>
 * This class implements the {@link Persistable} interface to solve a specific challenge
 * with Data Seeding.
 * <p>
 * <strong>The Problem:</strong>
 * When seeding data from CSVs, we manually assign IDs (e.g., User ID 1).
 * By default, Spring Data JPA assumes that if an object has a non-null ID, it must
 * already exist in the database, so it attempts an SQL {@code UPDATE}.
 * On an empty database, this results in an {@code ObjectOptimisticLockingFailureException}
 * because the row doesn't exist to be updated.
 * <p>
 * <strong>The Solution:</strong>
 * By implementing {@code Persistable}, we override the {@code isNew()} method.
 * We default {@code isNew} to {@code true}, forcing Hibernate to issue an SQL {@code INSERT}
 * even if the ID is already set. After loading/saving, the {@code @PostLoad} and
 * {@code @PostPersist} hooks automatically flip the flag to {@code false} so that future
 * updates work normally.
 */
@MappedSuperclass
public abstract class BaseEntity implements Persistable<Long> {

    @Id
    @Column(name = "id")
    private Long id;

    /**
     * Transient flag to track if the entity is new.
     * Defaults to true to ensure CSV seeder inserts records instead of updating them.
     * Not persisted to the database.
     */
    @Transient
    private boolean isNew = true;

    // GETTERS AND SETTERS

    @Override
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    /**
     * Manual setter for the new state, useful if specific logic requires
     * forcing an update on a detached entity.
     */
    public void setIsNew(boolean isNew) {
        this.isNew = isNew;
    }

    // LIFECYCLE HOOK
    /**
     * Lifecycle hook to update the state after the entity is loaded from the DB
     * or saved successfully. This ensures that future repository.save() calls
     * perform an UPDATE as expected.
     */
    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}