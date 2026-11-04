package com.litera.backend.controller;

import com.litera.backend.model.AdminSetupClaim;
import com.litera.backend.model.Role;
import com.litera.backend.model.User;
import com.litera.backend.repository.AdminSetupClaimRepository;
import com.litera.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final AdminSetupClaimRepository adminSetupClaimRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextRepository securityContextRepository;
    private final String adminSetupKey;

    public AuthController(UserRepository userRepository, AdminSetupClaimRepository adminSetupClaimRepository,
                          PasswordEncoder passwordEncoder, SecurityContextRepository securityContextRepository,
                          @Value("${app.admin.initial-setup-key:}") String adminSetupKey) {
        this.userRepository = userRepository;
        this.adminSetupClaimRepository = adminSetupClaimRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityContextRepository = securityContextRepository;
        this.adminSetupKey = adminSetupKey;
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken csrfToken) {
        return csrfToken;
    }

    @PostMapping("/register")
    public ResponseEntity<UserView> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = new User(request.name().trim(), email, request.phone(),
                passwordEncoder.encode(request.password()), Role.USER);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserView.from(userRepository.save(user)));
    }

    @PostMapping("/register-admin")
    @Transactional
    public ResponseEntity<UserView> registerAdmin(@Valid @RequestBody AdminRegisterRequest request) {
        if (adminSetupKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Admin account setup is not configured");
        }
        if (!MessageDigest.isEqual(
                adminSetupKey.getBytes(StandardCharsets.UTF_8),
                request.setupKey().getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid admin setup key");
        }
        if (userRepository.existsByRole(Role.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Admin account setup is already complete");
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        try {
            adminSetupClaimRepository.saveAndFlush(new AdminSetupClaim(1L, email));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Admin account setup is already complete", exception);
        }

        User user = new User(request.name().trim(), email, null,
                passwordEncoder.encode(request.password()), Role.ADMIN);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserView.from(userRepository.save(user)));
    }

    @PostMapping("/login")
    public UserView login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest,
                          HttpServletResponse servletResponse) {
        String identifier = request.identifier().trim();
        User user = userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByNameIgnoreCaseAndRole(identifier, Role.ADMIN))
                .filter(account -> passwordEncoder.matches(request.password(), account.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                user.getEmail(), null, authorities);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, servletRequest, servletResponse);
        return UserView.from(user);
    }

    @GetMapping("/me")
    public UserView currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required");
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .map(UserView::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response,
                                       Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.noContent().build();
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @Size(max = 30) String phone,
            @NotBlank @Size(min = 8, max = 72) String password) {
    }

    public record AdminRegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 256) String setupKey,
            @NotBlank @Size(min = 8, max = 72) String password) {
    }

    public record LoginRequest(@NotBlank String identifier, @NotBlank String password) {
    }

    public record UserView(Long id, String name, String email, String role) {
        static UserView from(User user) {
            return new UserView(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
        }
    }
}
