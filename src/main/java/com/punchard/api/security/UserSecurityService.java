package com.punchard.api.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for security-related checks used in @PreAuthorize annotations.
 */
@Service("userSecurityService")
public class UserSecurityService {

    /**
     * Checks if the authenticated user owns the resource with the given ID.
     *
     * @param resourceId the ID of the resource being accessed
     * @param authentication the current authentication
     * @return true if the authenticated user owns the resource
     */
    public boolean isOwner(UUID resourceId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return resourceId.equals(userPrincipal.getId());
        }

        return false;
    }
}

