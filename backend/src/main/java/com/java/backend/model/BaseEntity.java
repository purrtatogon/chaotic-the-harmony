package com.java.backend.model;

import jakarta.persistence.*;
import org.springframework.data.domain.Persistable;

/**
 * Shared id field for seeded data. CSV rows set ids manually; {@link Persistable#isNew()}
 * starts true so the first save is an INSERT, then hooks flip it off for normal updates.
 */
@MappedSuperclass
public abstract class BaseEntity implements Persistable<Long> {

    @Id
    @Column(name = "id")
    private Long id;

    /** Not stored in the DB; used so seeded rows with preset ids still insert once. */
    @Transient
    private boolean isNew = true;

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

    /** Optional override if you need to force treat-as-new again. */
    public void setIsNew(boolean isNew) {
        this.isNew = isNew;
    }

    /** After load or first save, normal updates should run. */
    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}