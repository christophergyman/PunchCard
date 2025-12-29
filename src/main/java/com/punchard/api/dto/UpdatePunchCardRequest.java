package com.punchard.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

public record UpdatePunchCardRequest(
        @Size(max = 100, message = "Title must be at most 100 characters")
        String title,

        @Size(max = 500, message = "Description must be at most 500 characters")
        String description,

        @Size(max = 255, message = "Reward must be at most 255 characters")
        String reward,

        @Valid
        CardStyleDto cardStyle
) {
    public boolean hasUpdates() {
        return title != null || description != null || reward != null || cardStyle != null;
    }
}
