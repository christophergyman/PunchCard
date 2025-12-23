package com.punchard.api.security;

import com.punchard.api.model.Role;
import com.punchard.api.model.User;

import java.util.UUID;

/**
 * Utility class for generating test JWT tokens.
 */
public class TestJwtUtils {

    private static final String TEST_SECRET = "test-secret-key-for-jwt-testing-must-be-at-least-32-characters-long";
    private static final long TEST_EXPIRATION = 28800000L;
    
    private static final JwtService jwtService = new JwtService(TEST_SECRET, TEST_EXPIRATION);

    /**
     * Generates a valid JWT token for a user with the given ID and role.
     */
    public static String generateToken(UUID userId, String username, Role role) {
        User user = User.builder()
                .id(userId)
                .username(username)
                .email(username + "@example.com")
                .password("hashedpassword")
                .role(role)
                .build();
        return jwtService.generateToken(user);
    }

    /**
     * Generates a valid JWT token for a regular USER.
     */
    public static String generateUserToken(UUID userId, String username) {
        return generateToken(userId, username, Role.USER);
    }

    /**
     * Generates a valid JWT token for an ADMIN.
     */
    public static String generateAdminToken(UUID userId, String username) {
        return generateToken(userId, username, Role.ADMIN);
    }

    /**
     * Creates a Bearer authorization header value.
     */
    public static String bearerToken(String token) {
        return "Bearer " + token;
    }
}

