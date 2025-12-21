package com.punchard.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.punchard.api.config.TestSecurityConfig;
import com.punchard.api.dto.CreateUserRequest;
import com.punchard.api.dto.UpdateUserRequest;
import com.punchard.api.dto.UserResponse;
import com.punchard.api.exception.DuplicateUserException;
import com.punchard.api.exception.GlobalExceptionHandler;
import com.punchard.api.exception.UserNotFoundException;
import com.punchard.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import({TestSecurityConfig.class, GlobalExceptionHandler.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    private static final UUID TEST_USER_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    private static final Instant NOW = Instant.now();

    private UserResponse createTestUserResponse() {
        return new UserResponse(TEST_USER_ID, "testuser", "test@example.com", NOW, NOW);
    }

    // ==================== CREATE USER TESTS ====================

    @Test
    void createUser_shouldReturn201_whenValidRequest() throws Exception {
        CreateUserRequest request = new CreateUserRequest("testuser", "password123", "test@example.com");
        UserResponse response = createTestUserResponse();

        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(TEST_USER_ID.toString()))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(userService).createUser(any(CreateUserRequest.class));
    }

    @Test
    void createUser_shouldReturn400_whenUsernameBlank() throws Exception {
        CreateUserRequest request = new CreateUserRequest("", "password123", "test@example.com");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.errors.username").exists());

        verify(userService, never()).createUser(any());
    }

    @Test
    void createUser_shouldReturn400_whenUsernameTooShort() throws Exception {
        CreateUserRequest request = new CreateUserRequest("ab", "password123", "test@example.com");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.username").value("Username must be 3-50 characters"));

        verify(userService, never()).createUser(any());
    }

    @Test
    void createUser_shouldReturn400_whenPasswordTooShort() throws Exception {
        CreateUserRequest request = new CreateUserRequest("testuser", "short", "test@example.com");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").value("Password must be at least 8 characters"));

        verify(userService, never()).createUser(any());
    }

    @Test
    void createUser_shouldReturn400_whenEmailInvalid() throws Exception {
        CreateUserRequest request = new CreateUserRequest("testuser", "password123", "invalid-email");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").value("Must be a valid email address"));

        verify(userService, never()).createUser(any());
    }

    @Test
    void createUser_shouldReturn409_whenUsernameExists() throws Exception {
        CreateUserRequest request = new CreateUserRequest("existinguser", "password123", "test@example.com");

        when(userService.createUser(any(CreateUserRequest.class)))
                .thenThrow(new DuplicateUserException("username", "existinguser"));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("User with username 'existinguser' already exists"));
    }

    @Test
    void createUser_shouldReturn409_whenEmailExists() throws Exception {
        CreateUserRequest request = new CreateUserRequest("testuser", "password123", "existing@example.com");

        when(userService.createUser(any(CreateUserRequest.class)))
                .thenThrow(new DuplicateUserException("email", "existing@example.com"));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("User with email 'existing@example.com' already exists"));
    }

    // ==================== GET ALL USERS TESTS ====================

    @Test
    void getAllUsers_shouldReturn200_withPaginatedResults() throws Exception {
        UserResponse user1 = new UserResponse(TEST_USER_ID, "user1", "user1@example.com", NOW, NOW);
        UserResponse user2 = new UserResponse(UUID.randomUUID(), "user2", "user2@example.com", NOW, NOW);
        Page<UserResponse> page = new PageImpl<>(List.of(user1, user2));

        when(userService.getAllUsers(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].username").value("user1"))
                .andExpect(jsonPath("$.content[1].username").value("user2"))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void getAllUsers_shouldReturn200_withEmptyList() throws Exception {
        Page<UserResponse> emptyPage = new PageImpl<>(List.of());

        when(userService.getAllUsers(any(Pageable.class))).thenReturn(emptyPage);

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(0))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void getAllUsers_shouldAcceptPaginationParams() throws Exception {
        Page<UserResponse> page = new PageImpl<>(List.of());

        when(userService.getAllUsers(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/users")
                        .param("page", "1")
                        .param("size", "10"))
                .andExpect(status().isOk());

        verify(userService).getAllUsers(any(Pageable.class));
    }

    // ==================== GET USER BY ID TESTS ====================

    @Test
    void getUserById_shouldReturn200_whenUserExists() throws Exception {
        UserResponse response = createTestUserResponse();

        when(userService.getUserById(TEST_USER_ID)).thenReturn(response);

        mockMvc.perform(get("/api/users/{id}", TEST_USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_USER_ID.toString()))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void getUserById_shouldReturn404_whenUserNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        when(userService.getUserById(nonExistentId))
                .thenThrow(new UserNotFoundException(nonExistentId));

        mockMvc.perform(get("/api/users/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("User not found with id: " + nonExistentId));
    }

    // ==================== UPDATE USER TESTS ====================

    @Test
    void updateUser_shouldReturn200_whenValidRequest() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest("updateduser", null, null);
        UserResponse response = new UserResponse(TEST_USER_ID, "updateduser", "test@example.com", NOW, NOW);

        when(userService.updateUser(eq(TEST_USER_ID), any(UpdateUserRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/users/{id}", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("updateduser"));
    }

    @Test
    void updateUser_shouldReturn404_whenUserNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        UpdateUserRequest request = new UpdateUserRequest("updateduser", null, null);

        when(userService.updateUser(eq(nonExistentId), any(UpdateUserRequest.class)))
                .thenThrow(new UserNotFoundException(nonExistentId));

        mockMvc.perform(put("/api/users/{id}", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void updateUser_shouldReturn409_whenDuplicateUsername() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest("existinguser", null, null);

        when(userService.updateUser(eq(TEST_USER_ID), any(UpdateUserRequest.class)))
                .thenThrow(new DuplicateUserException("username", "existinguser"));

        mockMvc.perform(put("/api/users/{id}", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void updateUser_shouldReturn400_whenUsernameTooShort() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest("ab", null, null);

        mockMvc.perform(put("/api/users/{id}", TEST_USER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.username").value("Username must be 3-50 characters"));
    }

    // ==================== DELETE USER TESTS ====================

    @Test
    void deleteUser_shouldReturn204_whenUserExists() throws Exception {
        doNothing().when(userService).deleteUser(TEST_USER_ID);

        mockMvc.perform(delete("/api/users/{id}", TEST_USER_ID))
                .andExpect(status().isNoContent());

        verify(userService).deleteUser(TEST_USER_ID);
    }

    @Test
    void deleteUser_shouldReturn404_whenUserNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        doThrow(new UserNotFoundException(nonExistentId))
                .when(userService).deleteUser(nonExistentId);

        mockMvc.perform(delete("/api/users/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }
}

