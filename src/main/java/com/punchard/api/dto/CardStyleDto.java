package com.punchard.api.dto;

import com.punchard.api.model.CardStyle;
import com.punchard.api.model.PunchShape;
import jakarta.validation.constraints.Pattern;

public record CardStyleDto(
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Background color must be a valid hex color (e.g., #FF5733)")
        String backgroundColor,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Text color must be a valid hex color (e.g., #000000)")
        String textColor,

        String texture,

        PunchShape punchShape
) {
    public static CardStyleDto fromEntity(CardStyle cardStyle) {
        if (cardStyle == null) {
            return new CardStyleDto("#FFFFFF", "#000000", null, PunchShape.CIRCLE);
        }
        return new CardStyleDto(
                cardStyle.getBackgroundColor(),
                cardStyle.getTextColor(),
                cardStyle.getTexture(),
                cardStyle.getPunchShape()
        );
    }

    public CardStyle toEntity() {
        return CardStyle.builder()
                .backgroundColor(backgroundColor != null ? backgroundColor : "#FFFFFF")
                .textColor(textColor != null ? textColor : "#000000")
                .texture(texture)
                .punchShape(punchShape != null ? punchShape : PunchShape.CIRCLE)
                .build();
    }
}
