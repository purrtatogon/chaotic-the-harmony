package com.java.backend.model.enums;

public enum MusicStyle {
    STANDARD("STD"), DELUXE("DLX"), COLOR_VARIANT("CLR");

    private final String code;
    MusicStyle(String code) { this.code = code; }
    public String getCode() { return code; }
}
