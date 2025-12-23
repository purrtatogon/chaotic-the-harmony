package com.java.backend.model.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MusicStyleConverter implements AttributeConverter<MusicStyle, String> {
    @Override
    public String convertToDatabaseColumn(MusicStyle attribute) {
        return (attribute == null) ? null : attribute.getCode();
    }
    @Override
    public MusicStyle convertToEntityAttribute(String dbData) {
        return (dbData == null) ? null : MusicStyle.fromString(dbData);
    }
}
