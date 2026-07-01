package com.wonmally.app.auth.service;

import com.wonmally.app.audit.service.AuditService;
import com.wonmally.app.auth.dto.*;
import com.wonmally.app.exception.AccountLockedException;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.security.CustomUserPrincipal;
import com.wonmally.app.security.JwtService;
import com.wonmally.app.user.entity.RefreshToken;
import com.wonmally.app.user.entity.Role;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.RefreshTokenRepository;
import com.wonmally.app.user.repository.RoleRepository;
import com.wonmally.app.user.repository.UserRepository;
import com.wonmally.app.utils.HashUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Set;

/**
 * Service d'authentification — inscription, connexion, refresh, déconnexion.
 *
 * Sécurité implémentée :
 *  - Refresh token rotation : chaque appel /refresh invalide l'ancien token et en émet un nouveau
 *  - Hash SHA-256 : seul le hash du refresh token est stocké en DB (protection token theft)
 *  - Brute force : verrouillage compte après MAX_FAILED_ATTEMPTS échecs consécutifs
 *  - Audit : chaque événement auth est journalisé de manière asynchrone
 */
@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthService {

    private static final int    MAX_FAILED_ATTEMPTS       = 5;
    private static final int    LOCK_DURATION_MINUTES     = 15;
    private static final long   REFRESH_TOKEN_VALIDITY_DAYS = 7;

    private final UserRepository         userRepository;
    private final RoleRepository         roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder        passwordEncoder;
    private final JwtService             jwtService;
    private final AuthenticationManager  authenticationManager;
    private final AuditService           auditService;

    // -------------------------------------------------------------------------
    // Inscription
    // -------------------------------------------------------------------------

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            auditService.logAuthEventAnonymous("REGISTER_FAILED_EMAIL_EXISTS", request.getEmail(), ipAddress);
            throw new BadRequestException("Un compte existe déjà avec cet email.");
        }

        Role citizenRole = roleRepository.findByName("CITIZEN")
                .orElseThrow(() -> new IllegalStateException("Rôle CITIZEN non initialisé. Vérifier le seed."));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .verified(false)
                .roles(Set.of(citizenRole))
                .build();

        userRepository.save(user);
        auditService.logAuthEvent("REGISTER_SUCCESS", user, ipAddress);

        return buildAuthResponse(user);
    }

    // -------------------------------------------------------------------------
    // Connexion
    // -------------------------------------------------------------------------

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress) {
        // Vérification du verrouillage AVANT l'authentification (évite un appel inutile)
        userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
            if (isAccountLocked(u)) {
                throw new AccountLockedException(
                    "Compte temporairement verrouillé suite à trop de tentatives. " +
                    "Réessayez dans " + LOCK_DURATION_MINUTES + " minutes.");
            }
        });

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            handleFailedLogin(request.getEmail(), ipAddress);
            throw new BadRequestException("Email ou mot de passe incorrect.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Utilisateur introuvable."));

        // Réinitialisation du compteur de tentatives après un succès
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        auditService.logAuthEvent("LOGIN_SUCCESS", user, ipAddress);
        return buildAuthResponse(user);
    }

    // -------------------------------------------------------------------------
    // Refresh Token — rotation complète
    // -------------------------------------------------------------------------

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request, String ipAddress) {
        String incomingHash = HashUtils.sha256Hex(request.getRefreshToken());

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(incomingHash)
                .orElseThrow(() -> new BadRequestException("Refresh token invalide."));

        if (Boolean.TRUE.equals(storedToken.getRevoked())) {
            // Token révoqué utilisé → possible token theft : on invalide toute la session
            User victim = storedToken.getUser();
            refreshTokenRepository.deleteByUserId(victim.getId());
            auditService.logAuthEvent("TOKEN_THEFT_SUSPECTED", victim, ipAddress);
            throw new BadRequestException("Session invalidée pour raison de sécurité. Veuillez vous reconnecter.");
        }

        if (storedToken.getExpirationDate().isBefore(LocalDateTime.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new BadRequestException("Refresh token expiré. Veuillez vous reconnecter.");
        }

        // Rotation : on révoque l'ancien token et on en émet un nouveau
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        User user = storedToken.getUser();
        String newAccessToken  = jwtService.generateToken(new CustomUserPrincipal(user));
        String newRawToken     = generateSecureRandomToken();
        String newTokenHash    = HashUtils.sha256Hex(newRawToken);

        RefreshToken newToken = RefreshToken.builder()
                .user(user)
                .tokenHash(newTokenHash)
                .expirationDate(LocalDateTime.now().plusDays(REFRESH_TOKEN_VALIDITY_DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newToken);

        auditService.logAuthEvent("TOKEN_REFRESHED", user, ipAddress);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRawToken)
                .tokenType("Bearer")
                .build();
    }

    // -------------------------------------------------------------------------
    // Déconnexion
    // -------------------------------------------------------------------------

    @Transactional
    public void logout(String rawRefreshToken, String ipAddress) {
        String hash = HashUtils.sha256Hex(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            auditService.logAuthEvent("LOGOUT", token.getUser(), ipAddress);
        });
    }

    // -------------------------------------------------------------------------
    // Helpers privés
    // -------------------------------------------------------------------------

    private AuthResponse buildAuthResponse(User user) {
        UserDetails principal   = new CustomUserPrincipal(user);
        String accessToken      = jwtService.generateToken(principal);
        String rawRefreshToken  = generateSecureRandomToken();
        String tokenHash        = HashUtils.sha256Hex(rawRefreshToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expirationDate(LocalDateTime.now().plusDays(REFRESH_TOKEN_VALIDITY_DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .build();
    }

    private void handleFailedLogin(String email, String ipAddress) {
        userRepository.findByEmail(email).ifPresent(user -> {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
                auditService.logAuthEvent("ACCOUNT_LOCKED", user, ipAddress);
            } else {
                auditService.logAuthEvent("LOGIN_FAILED_ATTEMPT_" + attempts, user, ipAddress);
            }
            userRepository.save(user);
        });
        if (userRepository.findByEmail(email).isEmpty()) {
            auditService.logAuthEventAnonymous("LOGIN_FAILED_UNKNOWN_EMAIL", email, ipAddress);
        }
    }

    private boolean isAccountLocked(User user) {
        return user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now());
    }

    private String generateSecureRandomToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] tokenBytes = new byte[64];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
}
