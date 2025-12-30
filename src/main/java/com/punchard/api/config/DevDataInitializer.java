package com.punchard.api.config;

import com.punchard.api.model.Role;
import com.punchard.api.model.User;
import com.punchard.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initDevData() {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@example.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .build();
                userRepository.save(admin);
                log.info("Created default admin user: admin / admin123");
            }
        };
    }
}
