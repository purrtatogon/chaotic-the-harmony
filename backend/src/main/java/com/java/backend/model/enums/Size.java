package com.java.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.annotation.JsonCreator;

// I will give these sizes a custom property (descriptor) so that they can hold values like "2XL"
public enum Size {
    // for Apparel
    XXS("XXS"),
    XS("XS"),
    S("S"),
    M("M"),
    L("L"),
    XL("XL"),
    XXL("2XL"),   // the Java name is XXL but the database value is "2XL"
    XXXL("3XL"),
    XXXXL("4XL"),
    XXXXXL("5XL"),

    // for Accessories
    Small("SML"),
    Medium("MED"),
    Large("LRG"),

    NA("N/A");

    private final String descriptor;

    Size(String descriptor) {
        this.descriptor = descriptor;
    }

    @JsonValue
    public String getDescriptor() { return descriptor; }

    @JsonCreator
    public static Size fromString(String value) {
        if (value == null) return null;
        for (Size s : Size.values()) {
            if (s.descriptor.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) {
                return s;
            }
        }
        return NA; // Safe fallback
    }
}