package com.wonmally.app.auth.service;

import com.wonmally.app.audit.service.AuditService;
import com.wonmally.app.auth.dto.*;
import com.wonmally.app.citizen.entity.Citizen;
import com.wonmally.app.citizen.repository.CitizenRepository;
import com.wonmally.app.exception.AccountLockedException;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.security.CustomUserPrincipal;
import com.wonmally.app.security.JwtService;
import com.wonmally.app.user.entity.PasswordResetToken;
import com.wonmally.app.user.entity.RefreshToken;
import com.wonmally.app.user.entity.Role;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.PasswordResetTokenRepository;
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
    private final CitizenRepository      citizenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService           emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            auditService.logAuthEventAnonymous("REGISTER_FAILED_EMAIL_EXISTS", request.getEmail(), ipAddress);
            throw new BadRequestException("Un compte existe deja avec cet email.");
        }

        Role citizenRole = roleRepository.findByName("CITIZEN")
                .orElseThrow(() -> new IllegalStateException("Role CITIZEN non initialise. Verifier le seed."));

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

        User savedUser = userRepository.save(user);

        Citizen citizen = Citizen.builder()
                .user(savedUser)
                .build();
        citizenRepository.save(citizen);

        auditService.logAuthEvent("REGISTER_SUCCESS", savedUser, ipAddress);

        return buildAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress) {
        userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
            if (isAccountLocked(u)) {
                throw new AccountLockedException(
                    "Compte temporairement verrouille suite a trop de tentatives. " +
                    "Reessayez dans " + LOCK_DURATION_MINUTES + " minutes.");
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

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        auditService.logAuthEvent("LOGIN_SUCCESS", user, ipAddress);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request, String ipAddress) {
        String incomingHash = HashUtils.sha256Hex(request.getRefreshToken());

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(incomingHash)
                .orElseThrow(() -> new BadRequestException("Refresh token invalide."));

        if (Boolean.TRUE.equals(storedToken.getRevoked())) {
            User victim = storedToken.getUser();
            refreshTokenRepository.deleteByUserId(victim.getId());
            auditService.logAuthEvent("TOKEN_THEFT_SUSPECTED", victim, ipAddress);
            throw new BadRequestException("Session invalidee pour raison de securite. Veuillez vous reconnecter.");
        }

        if (storedToken.getExpirationDate().isBefore(LocalDateTime.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new BadRequestException("Refresh token expire. Veuillez vous reconnecter.");
        }

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

    @Transactional
    public void logout(String rawRefreshToken, String ipAddress) {
        String hash = HashUtils.sha256Hex(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            auditService.logAuthEvent("LOGOUT", token.getUser(), ipAddress);
        });
    }

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

    private static final int PASSWORD_RESET_TOKEN_VALIDITY_HOURS = 1;

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, String ipAddress) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());

            String rawToken = generateSecureRandomToken();
            String tokenHash = HashUtils.sha256Hex(rawToken);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(tokenHash)
                    .expirationDate(LocalDateTime.now().plusHours(PASSWORD_RESET_TOKEN_VALIDITY_HOURS))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String resetLink = "http://localhost:5173/reset-password?token=" + rawToken;
            emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

            auditService.logAuthEvent("PASSWORD_RESET_REQUESTED", user, ipAddress);
        });
        // Reponse identique que l'email existe ou non, pour ne pas reveler les comptes existants.
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request, String ipAddress) {
        String tokenHash = HashUtils.sha256Hex(request.getToken());

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Lien de reinitialisation invalide ou expire."));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new BadRequestException("Ce lien de reinitialisation a deja ete utilise.");
        }

        if (resetToken.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Ce lien de reinitialisation a expire. Veuillez en redemander un.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        refreshTokenRepository.deleteByUserId(user.getId());

        auditService.logAuthEvent("PASSWORD_RESET_COMPLETED", user, ipAddress);
    }
}
