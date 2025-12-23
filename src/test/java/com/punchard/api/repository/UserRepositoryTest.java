package com.punchard.api.repository;

import com.punchard.api.model.Role;
import com.punchard.api.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("hashedpassword")
                .build();
    }

    @Test
    @DisplayName("User should have default role of USER when not specified")
    void userShouldHaveDefaultRoleUser() {
        User savedUser = userRepository.save(testUser);

        assertThat(savedUser.getRole()).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("User role should persist correctly when set to ADMIN")
    void userRoleShouldPersistAsAdmin() {
        testUser.setRole(Role.ADMIN);
        User savedUser = userRepository.save(testUser);

        User foundUser = userRepository.findById(savedUser.getId()).orElseThrow();
        assertThat(foundUser.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("User role should persist correctly when set to USER")
    void userRoleShouldPersistAsUser() {
        testUser.setRole(Role.USER);
        User savedUser = userRepository.save(testUser);

        User foundUser = userRepository.findById(savedUser.getId()).orElseThrow();
        assertThat(foundUser.getRole()).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("findByUsername should return user when exists")
    void findByUsernameShouldReturnUserWhenExists() {
        userRepository.save(testUser);

        Optional<User> foundUser = userRepository.findByUsername("testuser");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("testuser");
        assertThat(foundUser.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("findByUsername should return empty when user does not exist")
    void findByUsernameShouldReturnEmptyWhenNotExists() {
        Optional<User> foundUser = userRepository.findByUsername("nonexistent");

        assertThat(foundUser).isEmpty();
    }

    @Test
    @DisplayName("User with ADMIN role should be found by username with correct role")
    void adminUserShouldBeFoundWithCorrectRole() {
        testUser.setRole(Role.ADMIN);
        userRepository.save(testUser);

        Optional<User> foundUser = userRepository.findByUsername("testuser");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getRole()).isEqualTo(Role.ADMIN);
    }
}

