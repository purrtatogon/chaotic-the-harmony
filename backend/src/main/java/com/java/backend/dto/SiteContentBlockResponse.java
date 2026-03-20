package com.java.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** JSON for one CMS block (section, key, title, content). */
public class SiteContentBlockResponse {

    private String section;

    @JsonProperty("key")
    private String key;

    private String title;

    private String content;

    public SiteContentBlockResponse() {
    }

    public SiteContentBlockResponse(String section, String key, String title, String content) {
        this.section = section;
        this.key = key;
        this.title = title != null ? title : "";
        this.content = content != null ? content : "";
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
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
