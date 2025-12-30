package com.punchard.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.punchard.api.config.TestSecurityConfig;
import com.punchard.api.dto.CreateUserRequest;
import com.punchard.api.dto.UpdateUserRequest;
import com.punchard.api.dto.UserResponse;
import com.punchard.api.exception.GlobalExceptionHandler;
import com.punchard.api.model.Role;
import com.punchard.api.security.JwtAuthenticationFilter;
import com.punchard.api.security.UserPrincipal;
import com.punchard.api.security.UserSecurityService;
import com.punchard.api.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({TestSecurityConfig.class, GlobalExceptionHandler.class})
class UserControllerAuthTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private UserSecurityService userSecurityService;

    private static final UUID USER_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    private static final UUID OTHER_USER_ID = UUID.fromString("223e4567-e89b-12d3-a456-426614174001");
    private static final Instant NOW = Instant.now();

    private UserPrincipal regularUser;
    private UserPrincipal adminUser;

    @BeforeEach
    void setUp() {
        regularUser = new UserPrincipal(USER_ID, "testuser", Role.USER);
        adminUser = new UserPrincipal(USER_ID, "adminuser", Role.ADMIN);
    }

    @Nested
    @DisplayName("POST /api/users (Admin create user)")
    class CreateUserTests {

        @Test
        @DisplayName("should return 201 when user is admin")
        @WithMockUser(roles = "ADMIN")
        void createUser_shouldReturn201_whenAdmin() throws Exception {
            CreateUserRequest request = new CreateUserRequest("newuser", "password123", "new@example.com");
            UserResponse response = new UserResponse(UUID.randomUUID(), "newuser", "new@example.com", "USER", NOW, NOW);

            when(userService.createUser(any())).thenReturn(response);

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.username").value("newuser"));
        }

        @Test
        @DisplayName("should return 201 when using UserPrincipal with ADMIN role")
        void createUser_shouldReturn201_whenAdminPrincipal() throws Exception {
            CreateUserRequest request = new CreateUserRequest("newuser", "password123", "new@example.com");
            UserResponse response = new UserResponse(UUID.randomUUID(), "newuser", "new@example.com", "USER", NOW, NOW);

            when(userService.createUser(any())).thenReturn(response);

            mockMvc.perform(post("/api/users")
                            .with(user(adminUser))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.username").value("newuser"));
        }
    }

    @Nested
    @DisplayName("GET /api/users (List users)")
    class GetAllUsersTests {

        @Test
        @DisplayName("should return 200 when authenticated user")
        @WithMockUser
        void getAllUsers_shouldReturn200_whenAuthenticated() throws Exception {
            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/users/{id} (Get user by ID)")
    class GetUserByIdTests {

        @Test
        @DisplayName("should return 200 when authenticated user views any profile")
        @WithMockUser
        void getUserById_shouldReturn200_whenAuthenticated() throws Exception {
            UserResponse response = new UserResponse(OTHER_USER_ID, "otheruser", "other@example.com", "USER", NOW, NOW);
            when(userService.getUserById(OTHER_USER_ID)).thenReturn(response);

            mockMvc.perform(get("/api/users/{id}", OTHER_USER_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.username").value("otheruser"));
        }
    }

    @Nested
    @DisplayName("PUT /api/users/{id} (Update user)")
    class UpdateUserTests {

        @Test
        @DisplayName("should return 200 when user updates their own profile (owner)")
        void updateUser_shouldReturn200_whenOwner() throws Exception {
            UpdateUserRequest request = new UpdateUserRequest("updateduser", null, null);
            UserResponse response = new UserResponse(USER_ID, "updateduser", "test@example.com", "USER", NOW, NOW);

            // Mock the security service to return true for owner check
            when(userSecurityService.isOwner(eq(USER_ID), any())).thenReturn(true);
            when(userService.updateUser(eq(USER_ID), any())).thenReturn(response);

            mockMvc.perform(put("/api/users/{id}", USER_ID)
                            .with(user(regularUser))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.username").value("updateduser"));
        }

        @Test
        @DisplayName("should return 200 when admin updates any user's profile")
        @WithMockUser(roles = "ADMIN")
        void updateUser_shouldReturn200_whenAdmin() throws Exception {
            UpdateUserRequest request = new UpdateUserRequest("adminupdate", null, null);
            UserResponse response = new UserResponse(OTHER_USER_ID, "adminupdate", "other@example.com", "ADMIN", NOW, NOW);

            when(userService.updateUser(eq(OTHER_USER_ID), any())).thenReturn(response);

            mockMvc.perform(put("/api/users/{id}", OTHER_USER_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.username").value("adminupdate"));
        }
    }

    @Nested
    @DisplayName("DELETE /api/users/{id} (Delete user)")
    class DeleteUserTests {

        @Test
        @DisplayName("should return 204 when user deletes their own account (owner)")
        void deleteUser_shouldReturn204_whenOwner() throws Exception {
            // Mock the security service to return true for owner check
            when(userSecurityService.isOwner(eq(USER_ID), any())).thenReturn(true);
            doNothing().when(userService).deleteUser(USER_ID);

            mockMvc.perform(delete("/api/users/{id}", USER_ID)
                            .with(user(regularUser)))
                    .andExpect(status().isNoContent());

            verify(userService).deleteUser(USER_ID);
        }

        @Test
        @DisplayName("should return 204 when admin deletes any user's account")
        @WithMockUser(roles = "ADMIN")
        void deleteUser_shouldReturn204_whenAdmin() throws Exception {
            doNothing().when(userService).deleteUser(OTHER_USER_ID);

            mockMvc.perform(delete("/api/users/{id}", OTHER_USER_ID))
                    .andExpect(status().isNoContent());

            verify(userService).deleteUser(OTHER_USER_ID);
        }
    }
}
