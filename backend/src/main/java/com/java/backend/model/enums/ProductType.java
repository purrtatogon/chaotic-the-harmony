package com.java.backend.model.enums;

public enum ProductType {
    // Music
    CD("CD"), VINYL("VNL"),
    // Apparel
    TEE("TSH"), SWEATER("SWT"), HOODIE("HOO"), BEANIE("BNI"),
    // Accessories
    ACCESSORY("ACC"); // need to add these in a bit

    private final String code;

    ProductType(String code) { this.code = code; }
    public String getCode() { return code; }
}
