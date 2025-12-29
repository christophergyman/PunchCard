package com.punchard.api.controller;

import com.punchard.api.dto.CreatePunchRequest;
import com.punchard.api.dto.PunchResponse;
import com.punchard.api.security.UserPrincipal;
import com.punchard.api.service.PunchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards/{cardId}/punches")
public class PunchController {

    private final PunchService punchService;

    public PunchController(PunchService punchService) {
        this.punchService = punchService;
    }

    /**
     * Add a punch to a card - card owner only.
     */
    @PostMapping
    @PreAuthorize("@cardSecurityService.isCardOwner(#cardId, authentication)")
    public ResponseEntity<PunchResponse> addPunch(
            @PathVariable UUID cardId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePunchRequest request) {
        PunchResponse punch = punchService.addPunch(cardId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(punch);
    }

    /**
     * Get all punches for a card - any authenticated user can view.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PunchResponse>> getPunches(@PathVariable UUID cardId) {
        List<PunchResponse> punches = punchService.getPunchesByCard(cardId);
        return ResponseEntity.ok(punches);
    }
}
