package com.punchard.api.security;

import com.punchard.api.model.Role;
import com.punchard.api.model.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String TEST_SECRET = "test-secret-key-for-jwt-testing-must-be-at-least-32-characters-long";
    private static final long TEST_EXPIRATION = 28800000L; // 8 hours

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET, TEST_EXPIRATION);
        testUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("test@example.com")
                .password("hashedpassword")
                .role(Role.USER)
                .build();
    }

    @Test
    @DisplayName("generateToken should return non-null token for valid user")
    void generateToken_shouldReturnNonNullToken() {
        String token = jwtService.generateToken(testUser);

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    @DisplayName("generateToken should include correct username in token")
    void generateToken_shouldIncludeCorrectUsername() {
        String token = jwtService.generateToken(testUser);

        String username = jwtService.extractUsername(token);
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    @DisplayName("generateToken should include correct userId in token")
    void generateToken_shouldIncludeCorrectUserId() {
        String token = jwtService.generateToken(testUser);

        UUID userId = jwtService.extractUserId(token);
        assertThat(userId).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("generateToken should include correct role in token")
    void generateToken_shouldIncludeCorrectRole() {
        String token = jwtService.generateToken(testUser);

        String role = jwtService.extractRole(token);
        assertThat(role).isEqualTo("USER");
    }

    @Test
    @DisplayName("generateToken should include ADMIN role when user is admin")
    void generateToken_shouldIncludeAdminRole() {
        testUser.setRole(Role.ADMIN);
        String token = jwtService.generateToken(testUser);

        String role = jwtService.extractRole(token);
        assertThat(role).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("validateToken should return true for valid token")
    void validateToken_shouldReturnTrueForValidToken() {
        String token = jwtService.generateToken(testUser);

        boolean isValid = jwtService.validateToken(token);
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("validateToken should return false for malformed token")
    void validateToken_shouldReturnFalseForMalformedToken() {
        boolean isValid = jwtService.validateToken("invalid.token.here");

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("validateToken should return false for null token")
    void validateToken_shouldReturnFalseForNullToken() {
        boolean isValid = jwtService.validateToken(null);

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("validateToken should return false for empty token")
    void validateToken_shouldReturnFalseForEmptyToken() {
        boolean isValid = jwtService.validateToken("");

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("validateToken should return false for token with wrong secret")
    void validateToken_shouldReturnFalseForTokenWithWrongSecret() {
        // Create a token with a different secret
        SecretKey differentKey = Keys.hmacShaKeyFor(
                "different-secret-key-at-least-32-chars-long".getBytes(StandardCharsets.UTF_8));
        String tokenWithWrongSecret = Jwts.builder()
                .subject(testUser.getUsername())
                .claim("userId", testUser.getId().toString())
                .claim("role", testUser.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + TEST_EXPIRATION))
                .signWith(differentKey)
                .compact();

        boolean isValid = jwtService.validateToken(tokenWithWrongSecret);
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("isTokenExpired should return false for non-expired token")
    void isTokenExpired_shouldReturnFalseForNonExpiredToken() {
        String token = jwtService.generateToken(testUser);

        boolean isExpired = jwtService.isTokenExpired(token);
        assertThat(isExpired).isFalse();
    }

    @Test
    @DisplayName("isTokenExpired should return true for expired token")
    void isTokenExpired_shouldReturnTrueForExpiredToken() {
        // Create a JwtService with 0ms expiration
        JwtService expiredService = new JwtService(TEST_SECRET, 0);
        String token = expiredService.generateToken(testUser);

        // Wait a tiny bit to ensure token is expired
        try {
            Thread.sleep(10);
        } catch (InterruptedException ignored) {}

        boolean isExpired = expiredService.isTokenExpired(token);
        assertThat(isExpired).isTrue();
    }

    @Test
    @DisplayName("Constructor should throw exception when secret is null")
    void constructor_shouldThrowExceptionWhenSecretIsNull() {
        assertThatThrownBy(() -> new JwtService(null, TEST_EXPIRATION))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET environment variable must be set");
    }

    @Test
    @DisplayName("Constructor should throw exception when secret is blank")
    void constructor_shouldThrowExceptionWhenSecretIsBlank() {
        assertThatThrownBy(() -> new JwtService("", TEST_EXPIRATION))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET environment variable must be set");
    }

    @Test
    @DisplayName("Constructor should throw exception when secret is too short")
    void constructor_shouldThrowExceptionWhenSecretIsTooShort() {
        assertThatThrownBy(() -> new JwtService("short-secret", TEST_EXPIRATION))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT secret must be at least 32 characters long");
    }

    @Test
    @DisplayName("Tokens generated for different users should be different")
    void generateToken_shouldGenerateDifferentTokensForDifferentUsers() {
        User anotherUser = User.builder()
                .id(UUID.randomUUID())
                .username("anotheruser")
                .email("another@example.com")
                .password("hashedpassword")
                .role(Role.USER)
                .build();

        String token1 = jwtService.generateToken(testUser);
        String token2 = jwtService.generateToken(anotherUser);

        assertThat(token1).isNotEqualTo(token2);
    }
}

