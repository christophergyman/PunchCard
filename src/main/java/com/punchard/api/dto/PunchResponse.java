package com.punchard.api.dto;

import com.punchard.api.model.Punch;

import java.time.Instant;
import java.util.UUID;

public record PunchResponse(
        UUID id,
        UUID cardId,
        UUID punchedBy,
        int position,
        Instant punchedAt
) {
    public static PunchResponse fromEntity(Punch punch) {
        return new PunchResponse(
                punch.getId(),
                punch.getCard().getId(),
                punch.getPunchedBy().getId(),
                punch.getPosition(),
                punch.getPunchedAt()
        );
    }
}
