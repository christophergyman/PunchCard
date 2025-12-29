package com.punchard.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardStyle {

    @Column(length = 7)
    @Builder.Default
    private String backgroundColor = "#FFFFFF";

    @Column(length = 7)
    @Builder.Default
    private String textColor = "#000000";

    @Column(length = 255)
    private String texture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PunchShape punchShape = PunchShape.CIRCLE;
}
