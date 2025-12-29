package com.punchard.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record CreatePunchCardRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 100, message = "Title must be at most 100 characters")
        String title,

        @Size(max = 500, message = "Description must be at most 500 characters")
        String description,

        @NotNull(message = "Total slots is required")
        @Min(value = 1, message = "Total slots must be at least 1")
        @Max(value = 20, message = "Total slots must be at most 20")
        Integer totalSlots,

        @NotBlank(message = "Reward is required")
        @Size(max = 255, message = "Reward must be at most 255 characters")
        String reward,

        @Valid
        CardStyleDto cardStyle
) {}
