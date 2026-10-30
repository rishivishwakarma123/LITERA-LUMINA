package com.litera.backend.config;

import com.litera.backend.model.Role;
import com.litera.backend.model.User;
import com.litera.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class AdminBootstrap {
    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrap.class);

    @Bean
    public CommandLineRunner createAdmin(UserRepository users, PasswordEncoder passwordEncoder,
                                         @Value("${app.admin.username:rishi}") String username,
                                         @Value("${app.admin.password:}") String password) {
        return args -> {
            if (password.isBlank()) {
                logger.warn("Admin account was not bootstrapped; set LITERA_ADMIN_PASSWORD to enable admin login.");
                return;
            }

            String email = username.trim().toLowerCase(Locale.ROOT) + "@litera.local";
            if (users.findByNameIgnoreCaseAndRole(username, Role.ADMIN).isPresent()) {
                return;
            }
            if (users.existsByEmailIgnoreCase(email)) {
                throw new IllegalStateException("Cannot bootstrap admin: the configured admin email is already in use.");
            }
            users.save(new User(username.trim(), email, null, passwordEncoder.encode(password), Role.ADMIN));
        };
    }
}
