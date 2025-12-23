package com.java.backend.model.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SizeConverter implements AttributeConverter<Size, String> {
    @Override
    public String convertToDatabaseColumn(Size attribute) {
        return (attribute == null) ? null : attribute.getDescriptor();
    }
    @Override
    public Size convertToEntityAttribute(String dbData) {
        return (dbData == null) ? null : Size.fromString(dbData);
    }
}
