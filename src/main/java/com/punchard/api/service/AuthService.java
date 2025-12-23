package com.punchard.api.service;

import com.punchard.api.dto.AuthResponse;
import com.punchard.api.dto.CreateUserRequest;
import com.punchard.api.dto.LoginRequest;
import com.punchard.api.dto.UserResponse;
import com.punchard.api.model.User;
import com.punchard.api.repository.UserRepository;
import com.punchard.api.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling authentication operations.
 */
@Service
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserService userService,
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user and returns user info (without token).
     * User must login separately to get a token.
     */
    @Transactional
    public UserResponse register(CreateUserRequest request) {
        return userService.createUser(request);
    }

    /**
     * Authenticates a user and returns a JWT token.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(user);
        UserResponse userResponse = UserResponse.fromEntity(user);

        return new AuthResponse(token, userResponse);
    }
}

