package com.wonmally.app.auth.controller;

import com.wonmally.app.auth.dto.*;
import com.wonmally.app.auth.service.AuthService;
import com.wonmally.app.user.entity.Role;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.RoleRepository;
import com.wonmally.app.user.repository.UserRepository;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.security.CustomUserPrincipal;
import com.wonmally.app.user.dto.UserProfileResponseDTO;
import com.wonmally.app.user.mapper.UserMapper;
import com.wonmally.app.utils.CookieUtils;
import com.wonmally.app.utils.IpUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;
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
    private final UserMapper userMapper;

    @org.springframework.beans.factory.annotation.Value("${wonmally.security.jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;

    @org.springframework.beans.factory.annotation.Value("${wonmally.security.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @PostMapping("/register")
    @Operation(summary = "Créer un compte citoyen (necessite verification email avant connexion)")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request,
                                          HttpServletRequest httpRequest) {
        authService.register(request, IpUtils.extractClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    @Operation(summary = "Se connecter et obtenir les tokens JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest,
                                               HttpServletResponse httpResponse) {
        AuthResponse authResponse = authService.login(request, IpUtils.extractClientIp(httpRequest));
        setAuthCookies(httpResponse, authResponse, request.isRememberMe());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renouveler l'access token via le refresh token (rotation)")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request,
                                                 HttpServletRequest httpRequest,
                                                 HttpServletResponse httpResponse) {
        AuthResponse authResponse = authService.refresh(request, IpUtils.extractClientIp(httpRequest));
        setAuthCookies(httpResponse, authResponse, true);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "Révoquer la session courante")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request,
                                        HttpServletRequest httpRequest,
                                        HttpServletResponse httpResponse) {
        authService.logout(request.getRefreshToken(), IpUtils.extractClientIp(httpRequest));
        CookieUtils.clearAuthCookies(httpResponse);
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

        Objects.requireNonNull(userRepository.save(admin));
        return ResponseEntity.ok("Admin créé avec succès: admin@wonmally.com / admin123");
    }

    /**
     * Pose les cookies httpOnly access/refresh en complement du JSON de reponse.
     * "Se souvenir de moi" pilote la duree de vie (persistant vs session).
     */
    private void setAuthCookies(HttpServletResponse response, AuthResponse authResponse, boolean rememberMe) {
        int accessMaxAge = (int) (accessTokenExpirationMs / 1000);
        int refreshMaxAge = (int) (refreshTokenExpirationMs / 1000);
        CookieUtils.addAccessTokenCookie(response, authResponse.getAccessToken(), rememberMe, accessMaxAge);
        CookieUtils.addRefreshTokenCookie(response, authResponse.getRefreshToken(), rememberMe, refreshMaxAge);
    }

    @GetMapping("/me")
    @Operation(summary = "Recuperer les informations de l'utilisateur authentifie")
    public ResponseEntity<UserProfileResponseDTO> me(@org.springframework.security.core.annotation.AuthenticationPrincipal CustomUserPrincipal principal) {
        User user = userRepository.findById(Objects.requireNonNull(principal.getUserId()))
                .orElseThrow(() -> new BadRequestException("Utilisateur introuvable."));
        return ResponseEntity.ok(userMapper.toProfileResponse(user));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Demander un lien de reinitialisation de mot de passe par email")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request,
                                                HttpServletRequest httpRequest) {
        authService.forgotPassword(request, IpUtils.extractClientIp(httpRequest));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reinitialiser le mot de passe avec le token recu par email")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request,
                                               HttpServletRequest httpRequest) {
        authService.resetPassword(request, IpUtils.extractClientIp(httpRequest));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verifier l'adresse email via le token recu par email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.noContent().build();
    }
}
