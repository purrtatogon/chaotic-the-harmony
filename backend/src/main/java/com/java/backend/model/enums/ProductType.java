package com.java.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductType {
    CD("CD"), Vinyl("VNL"),
    Tee("TSH"), Sweater("SWT"), Hoodie("HOO"), Beanie("BNI"), Blanket("BLN"), Rug("RUG"), Coaster("CST"), Mug("MUG"), Pillow("PIL"), Keychain("KEY"), Magnet("MAG"), Sticker("STK"), Poster("POS");

    private final String code;

    ProductType(String code) { this.code = code; }

    @JsonValue
    public String getCode() { return code; } // return the code to the frontend

    @JsonCreator
    public static ProductType fromString(String value) {
        if (value == null || value.isEmpty()) return null;

        for (ProductType type : ProductType.values()) {
            // this checks against "Tee" OR "TSH"
            if (type.name().equalsIgnoreCase(value) || type.code.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown ProductType: " + value);
    }
}