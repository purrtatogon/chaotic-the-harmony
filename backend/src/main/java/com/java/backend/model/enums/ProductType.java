package com.java.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductType {
    CD("CD"),
    Vinyl("VYL"),
    Tee("TEE"),
    Sweater("SWT"),
    Hoodie("HDD"),
    Beanie("BNI"),
    Blanket("BLN"),
    Tote("TOT"),
    Coaster("COS"),
    Mug("MUG"),
    Magnet("MAG"),
    Sticker("STK"),
    Poster("POS");

    private final String code;

    ProductType(String code) { this.code = code; }

    @JsonValue
    public String getCode() { return code; }

    @JsonCreator
    public static ProductType fromString(String value) {
        if (value == null || value.isEmpty()) return null;

        String cleanValue = value.trim();

        for (ProductType type : ProductType.values()) {
            // Checks against Enum Name ("Tee") OR Code ("TEE")
            if (type.name().equalsIgnoreCase(cleanValue) || type.code.equalsIgnoreCase(cleanValue)) {
                return type;
            }
        }

        // Backward compatibility handling
        if ("TSH".equalsIgnoreCase(cleanValue)) return Tee;
        if ("HOO".equalsIgnoreCase(cleanValue)) return Hoodie;
        if ("CST".equalsIgnoreCase(cleanValue)) return Coaster;
        if ("VNL".equalsIgnoreCase(cleanValue)) return Vinyl;

        // Log error and return null instead of crashing the server!
        System.err.println("Warning: Unknown ProductType '" + value + "'. Returning null.");
        return null;
    }
}