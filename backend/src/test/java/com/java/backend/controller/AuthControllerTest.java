package com.java.backend.controller;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

// apparently JUnit 5 does not need public!
class AuthControllerTest {

    @Test
    void validatePassword_rejectsShortPassword() {
        assertEquals(
                "Password must be at least 12 characters.",
                AuthController.validatePassword("short")
        );
    }
}