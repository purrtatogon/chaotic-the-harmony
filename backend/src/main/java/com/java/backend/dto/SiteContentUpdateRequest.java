package com.java.backend.dto;

/**
 * Update body for site copy; section and key are immutable (set only at seed/create).
 */
public class SiteContentUpdateRequest {

    private String title;
    private String content;

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
