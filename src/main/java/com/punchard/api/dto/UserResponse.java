package com.punchard.api.dto;

import com.punchard.api.model.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String email,
        String role,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}

