package com.java.backend.repository;

import com.java.backend.model.SiteContentEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SiteContentRepository extends JpaRepository<SiteContentEntry, Long> {

    List<SiteContentEntry> findAllByOrderBySectionAscEntryKeyAsc();
}
