package com.punchard.api.security;

import com.punchard.api.model.Role;
import com.punchard.api.repository.PunchCardRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for card-related security checks used in @PreAuthorize annotations.
 */
@Service("cardSecurityService")
public class CardSecurityService {

    private final PunchCardRepository punchCardRepository;

    public CardSecurityService(PunchCardRepository punchCardRepository) {
        this.punchCardRepository = punchCardRepository;
    }

    /**
     * Checks if the authenticated user owns the punch card with the given ID.
     *
     * @param cardId the ID of the punch card being accessed
     * @param authentication the current authentication
     * @return true if the authenticated user owns the punch card
     */
    public boolean isCardOwner(UUID cardId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return punchCardRepository.existsByIdAndOwnerId(cardId, userPrincipal.getId());
        }

        return false;
    }

    /**
     * Checks if the authenticated user has ADMIN role.
     *
     * @param authentication the current authentication
     * @return true if the authenticated user is an admin
     */
    public boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getRole() == Role.ADMIN;
        }

        return false;
    }

    /**
     * Checks if the authenticated user is an admin OR owns the card.
     *
     * @param cardId the ID of the punch card
     * @param authentication the current authentication
     * @return true if admin or card owner
     */
    public boolean isAdminOrCardOwner(UUID cardId, Authentication authentication) {
        return isAdmin(authentication) || isCardOwner(cardId, authentication);
    }
}
