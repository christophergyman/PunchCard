package com.punchard.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "punches", indexes = {
        @Index(name = "idx_punch_card", columnList = "card_id"),
        @Index(name = "idx_punch_position", columnList = "card_id, position")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_punch_card_position", columnNames = {"card_id", "position"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Punch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private PunchCard card;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "punched_by", nullable = false)
    private User punchedBy;

    @Column(nullable = false)
    private int position;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant punchedAt;
}
