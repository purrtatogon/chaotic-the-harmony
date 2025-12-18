package com.java.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

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
    SML("Small"),
    MED("Medium"),
    LRG("Large"),

    NA("N/A");

    private final String descriptor;

    Size(String descriptor) {
        this.descriptor = descriptor;
    }

    // This annotation is MAGIC. It ensures "2XL" is stored in DB/JSON, not "XXL"
    @JsonValue
    public String getDescriptor() {
        return descriptor;
    }
}