package com.java.backend.model;

import jakarta.persistence.*;

/** One row of marketing copy from {@code data/cms_*.csv}. */
@Entity
@Table(
        name = "site_content_entries",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_site_content_section_key",
                columnNames = {"section", "entry_key"}
        )
)
public class SiteContentEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 128)
    private String section;

    @Column(name = "entry_key", nullable = false, length = 192)
    private String entryKey;

    @Column(columnDefinition = "TEXT")
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getEntryKey() {
        return entryKey;
    }

    public void setEntryKey(String entryKey) {
        this.entryKey = entryKey;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
