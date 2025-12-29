package com.punchard.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.punchard.api.config.TestSecurityConfig;
import com.punchard.api.dto.AuthResponse;
import com.punchard.api.dto.CreateUserRequest;
import com.punchard.api.dto.LoginRequest;
import com.punchard.api.dto.UserResponse;
import com.punchard.api.exception.DuplicateUserException;
import com.punchard.api.exception.GlobalExceptionHandler;
import com.punchard.api.security.JwtAuthenticationFilter;
import com.punchard.api.service.AuthService;
import com.punchard.api.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({TestSecurityConfig.class, GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private static final UUID TEST_USER_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    private static final Instant NOW = Instant.now();

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterTests {

        @Test
        @DisplayName("should return 201 and user response when registration is successful")
        void register_shouldReturn201_whenSuccessful() throws Exception {
            CreateUserRequest request = new CreateUserRequest("testuser", "password123", "test@example.com");
            UserResponse response = new UserResponse(TEST_USER_ID, "testuser", "test@example.com", NOW, NOW);

            when(authService.register(any(CreateUserRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(TEST_USER_ID.toString()))
                    .andExpect(jsonPath("$.username").value("testuser"))
                    .andExpect(jsonPath("$.email").value("test@example.com"));
        }

        @Test
        @DisplayName("should return 400 when username is blank")
        void register_shouldReturn400_whenUsernameBlank() throws Exception {
            CreateUserRequest request = new CreateUserRequest("", "password123", "test@example.com");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.username").exists());
        }

        @Test
        @DisplayName("should return 400 when email is invalid")
        void register_shouldReturn400_whenEmailInvalid() throws Exception {
            CreateUserRequest request = new CreateUserRequest("testuser", "password123", "invalid-email");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.email").exists());
        }

        @Test
        @DisplayName("should return 400 when password is too short")
        void register_shouldReturn400_whenPasswordTooShort() throws Exception {
            CreateUserRequest request = new CreateUserRequest("testuser", "short", "test@example.com");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.password").exists());
        }

        @Test
        @DisplayName("should return 409 when username already exists")
        void register_shouldReturn409_whenUsernameExists() throws Exception {
            CreateUserRequest request = new CreateUserRequest("existinguser", "password123", "test@example.com");

            when(authService.register(any(CreateUserRequest.class)))
                    .thenThrow(new DuplicateUserException("username", "existinguser"));

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.status").value(409))
                    .andExpect(jsonPath("$.message").value("User with username 'existinguser' already exists"));
        }

        @Test
        @DisplayName("should return 409 when email already exists")
        void register_shouldReturn409_whenEmailExists() throws Exception {
            CreateUserRequest request = new CreateUserRequest("testuser", "password123", "existing@example.com");

            when(authService.register(any(CreateUserRequest.class)))
                    .thenThrow(new DuplicateUserException("email", "existing@example.com"));

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message").value("User with email 'existing@example.com' already exists"));
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginTests {

        @Test
        @DisplayName("should return 200 and JWT token when credentials are valid")
        void login_shouldReturn200_whenCredentialsValid() throws Exception {
            LoginRequest request = new LoginRequest("testuser", "password123");
            UserResponse user = new UserResponse(TEST_USER_ID, "testuser", "test@example.com", NOW, NOW);
            AuthResponse response = new AuthResponse("jwt.token.here", user);

            when(authService.login(any(LoginRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value("jwt.token.here"))
                    .andExpect(jsonPath("$.type").value("Bearer"))
                    .andExpect(jsonPath("$.user.username").value("testuser"));
        }

        @Test
        @DisplayName("should return 401 when username is wrong")
        void login_shouldReturn401_whenUsernameWrong() throws Exception {
            LoginRequest request = new LoginRequest("wronguser", "password123");

            when(authService.login(any(LoginRequest.class)))
                    .thenThrow(new BadCredentialsException("Invalid username or password"));

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.error").value("Unauthorized"));
        }

        @Test
        @DisplayName("should return 401 when password is wrong")
        void login_shouldReturn401_whenPasswordWrong() throws Exception {
            LoginRequest request = new LoginRequest("testuser", "wrongpassword");

            when(authService.login(any(LoginRequest.class)))
                    .thenThrow(new BadCredentialsException("Invalid username or password"));

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("should return 400 when username is blank")
        void login_shouldReturn400_whenUsernameBlank() throws Exception {
            LoginRequest request = new LoginRequest("", "password123");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.username").exists());
        }

        @Test
        @DisplayName("should return 400 when password is blank")
        void login_shouldReturn400_whenPasswordBlank() throws Exception {
            LoginRequest request = new LoginRequest("testuser", "");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.password").exists());
        }
    }
}

