package com.java.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MusicStyle {
    Standard("STD"), Deluxe("DLX"), Color_Variant("CLR");

    private final String code;

    MusicStyle(String code) { this.code = code; }

    @JsonValue
    public String getCode() { return code; }

    @JsonCreator
    public static MusicStyle fromString(String value) {
        if (value == null) return null;
        for (MusicStyle style : MusicStyle.values()) {
            if (style.code.equalsIgnoreCase(value) || style.name().equalsIgnoreCase(value)) {
                return style;
            }
        }
        throw new IllegalArgumentException("Unknown MusicStyle: " + value);
    }
}