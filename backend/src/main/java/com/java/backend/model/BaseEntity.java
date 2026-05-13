package com.java.backend.model;

import jakarta.persistence.*;
import org.springframework.data.domain.Persistable;

/**
 * Seeds assign ids manually ({@link com.java.backend.service.DatabaseSeederService} + CSV imports).
 * Implementing Persistable tricks the first INSERT so preset ids actually persist.
 */
@MappedSuperclass
public abstract class BaseEntity implements Persistable<Long> {

    @Id
    @Column(name = "id")
    private Long id;

    /** Not a column — tells Spring Data whether to INSERT vs UPDATE while bootstrapping. */
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

    /** Rarely needed, but handy if you're re-inserting seeded rows manually. */
    public void setIsNew(boolean isNew) {
        this.isNew = isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}
