package com.java.backend.model.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ProductTypeConverter implements AttributeConverter<ProductType, String> {

    @Override
    public String convertToDatabaseColumn(ProductType attribute) {
        return (attribute == null) ? null : attribute.getCode(); // Saves e.g. "TEE" to DB
    }

    @Override
    public ProductType convertToEntityAttribute(String dbData) {
        return (dbData == null) ? null : ProductType.fromString(dbData); // Reads e.g. "TEE" from DB
    }
}