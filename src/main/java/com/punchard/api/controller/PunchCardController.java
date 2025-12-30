package com.punchard.api.controller;

import com.punchard.api.dto.CreatePunchCardRequest;
import com.punchard.api.dto.PunchCardResponse;
import com.punchard.api.dto.UpdatePunchCardRequest;
import com.punchard.api.security.UserPrincipal;
import com.punchard.api.service.PunchCardService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
public class PunchCardController {

    private final PunchCardService punchCardService;

    public PunchCardController(PunchCardService punchCardService) {
        this.punchCardService = punchCardService;
    }

    /**
     * Create a new punch card - ADMIN only.
     * Admin can specify the target user via ownerId, or defaults to admin's own ID.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PunchCardResponse> createCard(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePunchCardRequest request) {
        UUID targetOwnerId = request.ownerId() != null ? request.ownerId() : principal.getId();
        PunchCardResponse card = punchCardService.createCard(targetOwnerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(card);
    }

    /**
     * Get all cards owned by the authenticated user.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<PunchCardResponse>> getMyCards(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PunchCardResponse> cards = punchCardService.getCardsByOwner(principal.getId(), pageable);
        return ResponseEntity.ok(cards);
    }

    /**
     * Get a specific punch card by ID - owner or admin only.
     */
    @GetMapping("/{id}")
    @PreAuthorize("@cardSecurityService.isAdminOrCardOwner(#id, authentication)")
    public ResponseEntity<PunchCardResponse> getCardById(@PathVariable UUID id) {
        PunchCardResponse card = punchCardService.getCardById(id);
        return ResponseEntity.ok(card);
    }

    /**
     * Update a punch card - ADMIN only.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PunchCardResponse> updateCard(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePunchCardRequest request) {
        PunchCardResponse card = punchCardService.updateCard(id, request);
        return ResponseEntity.ok(card);
    }

    /**
     * Delete a punch card - ADMIN only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCard(@PathVariable UUID id) {
        punchCardService.deleteCard(id);
        return ResponseEntity.noContent().build();
    }
}
