package com.punchard.api.security;

import com.punchard.api.model.Role;
import com.punchard.api.model.User;
import com.punchard.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("test@example.com")
                .password("hashedpassword")
                .role(Role.USER)
                .build();
    }

    @Test
    @DisplayName("loadUserByUsername should return UserPrincipal when user exists")
    void loadUserByUsername_shouldReturnUserPrincipal_whenUserExists() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("testuser");
        assertThat(userDetails.getPassword()).isEqualTo("hashedpassword");
    }

    @Test
    @DisplayName("loadUserByUsername should return correct authorities for USER role")
    void loadUserByUsername_shouldReturnCorrectAuthorities_forUserRole() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails.getAuthorities())
                .hasSize(1)
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_USER"));
    }

    @Test
    @DisplayName("loadUserByUsername should return correct authorities for ADMIN role")
    void loadUserByUsername_shouldReturnCorrectAuthorities_forAdminRole() {
        testUser.setRole(Role.ADMIN);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails.getAuthorities())
                .hasSize(1)
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("loadUserByUsername should throw UsernameNotFoundException when user not found")
    void loadUserByUsername_shouldThrowException_whenUserNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("nonexistent"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found with username: nonexistent");
    }

    @Test
    @DisplayName("UserPrincipal should expose user ID")
    void userPrincipal_shouldExposeUserId() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails).isInstanceOf(UserPrincipal.class);
        UserPrincipal principal = (UserPrincipal) userDetails;
        assertThat(principal.getId()).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("UserPrincipal should expose email")
    void userPrincipal_shouldExposeEmail() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails).isInstanceOf(UserPrincipal.class);
        UserPrincipal principal = (UserPrincipal) userDetails;
        assertThat(principal.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("UserPrincipal should expose role")
    void userPrincipal_shouldExposeRole() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails).isInstanceOf(UserPrincipal.class);
        UserPrincipal principal = (UserPrincipal) userDetails;
        assertThat(principal.getRole()).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("UserPrincipal account should be non-expired, non-locked, and enabled")
    void userPrincipal_shouldBeActiveByDefault() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails.isAccountNonExpired()).isTrue();
        assertThat(userDetails.isAccountNonLocked()).isTrue();
        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
        assertThat(userDetails.isEnabled()).isTrue();
    }
}

