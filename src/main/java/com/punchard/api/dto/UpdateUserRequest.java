package com.punchard.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
        String username,

        @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
        String password,

        @Email(message = "Must be a valid email address")
        String email
) {
    public boolean hasUpdates() {
        return username != null || password != null || email != null;
    }
}

