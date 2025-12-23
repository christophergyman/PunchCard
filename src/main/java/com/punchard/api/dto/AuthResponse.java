package com.punchard.api.dto;

/**
 * Response DTO for authentication containing the JWT token.
 */
public record AuthResponse(
        String token,
        String type,
        UserResponse user
) {
    public AuthResponse(String token, UserResponse user) {
        this(token, "Bearer", user);
    }
}

