package com.punchard.api.dto;

import com.punchard.api.model.Punch;
import com.punchard.api.model.PunchCard;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PunchCardResponse(
        UUID id,
        UUID ownerId,
        String title,
        String description,
        int totalSlots,
        int currentPunches,
        String reward,
        CardStyleDto cardStyle,
        List<PunchResponse> punches,
        Instant createdAt,
        Instant updatedAt
) {
    public static PunchCardResponse fromEntity(PunchCard card) {
        List<PunchResponse> punchResponses = card.getPunches() != null
                ? card.getPunches().stream()
                    .map(PunchResponse::fromEntity)
                    .toList()
                : List.of();

        return new PunchCardResponse(
                card.getId(),
                card.getOwner().getId(),
                card.getTitle(),
                card.getDescription(),
                card.getTotalSlots(),
                card.getCurrentPunches(),
                card.getReward(),
                CardStyleDto.fromEntity(card.getCardStyle()),
                punchResponses,
                card.getCreatedAt(),
                card.getUpdatedAt()
        );
    }

    public static PunchCardResponse fromEntity(PunchCard card, List<Punch> punches) {
        List<PunchResponse> punchResponses = punches != null
                ? punches.stream()
                    .map(PunchResponse::fromEntity)
                    .toList()
                : List.of();

        return new PunchCardResponse(
                card.getId(),
                card.getOwner().getId(),
                card.getTitle(),
                card.getDescription(),
                card.getTotalSlots(),
                punches != null ? punches.size() : 0,
                card.getReward(),
                CardStyleDto.fromEntity(card.getCardStyle()),
                punchResponses,
                card.getCreatedAt(),
                card.getUpdatedAt()
        );
    }
}
