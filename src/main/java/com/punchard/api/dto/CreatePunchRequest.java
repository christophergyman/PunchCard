package com.punchard.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreatePunchRequest(
        @NotNull(message = "Position is required")
        @Min(value = 1, message = "Position must be at least 1")
        Integer position
) {}
