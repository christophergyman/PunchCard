package com.punchard.api.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        int status,
        String error,
        String message,
        Instant timestamp,
        Map<String, String> errors
) {
    public static ErrorResponse of(int status, String error, String message) {
        return new ErrorResponse(status, error, message, Instant.now(), null);
    }

    public static ErrorResponse withFieldErrors(int status, String error, String message, Map<String, String> errors) {
        return new ErrorResponse(status, error, message, Instant.now(), errors);
    }
}

