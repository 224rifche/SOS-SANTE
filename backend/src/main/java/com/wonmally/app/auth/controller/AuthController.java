package com.wonmally.app.auth.controller;

import com.wonmally.app.auth.dto.*;
import com.wonmally.app.auth.service.AuthService;
import com.wonmally.app.user.entity.Role;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.RoleRepository;
import com.wonmally.app.user.repository.UserRepository;
import com.wonmally.app.utils.IpUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Inscription, connexion et gestion des sessions JWT")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    @Operation(summary = "Créer un compte citoyen")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                  HttpServletRequest httpRequest) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request, IpUtils.extractClientIp(httpRequest)));
    }

    @PostMapping("/login")
    @Operation(summary = "Se connecter et obtenir les tokens JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(request, IpUtils.extractClientIp(httpRequest)));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renouveler l'access token via le refresh token (rotation)")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request,
                                                 HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.refresh(request, IpUtils.extractClientIp(httpRequest)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Révoquer la session courante")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request,
                                        HttpServletRequest httpRequest) {
        authService.logout(request.getRefreshToken(), IpUtils.extractClientIp(httpRequest));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/create-admin")
    @Operation(summary = "Créer un compte admin (endpoint temporaire pour développement)")
    public ResponseEntity<String> createAdmin() {
        if (userRepository.existsByEmail("admin@wonmally.com")) {
            return ResponseEntity.ok("Admin existe déjà");
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Role ADMIN non trouvé"));

        User admin = User.builder()
                .firstName("Administrateur")
                .lastName("Système")
                .email("admin@wonmally.com")
                .phone("+221 77 123 45 67")
                .password(passwordEncoder.encode("admin123"))
                .enabled(true)
                .verified(true)
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(admin);
        return ResponseEntity.ok("Admin créé avec succès: admin@wonmally.com / admin123");
    }
}
