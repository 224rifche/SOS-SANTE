package com.wonmally.app.auth.service;

import com.wonmally.app.auth.dto.*;
import com.wonmally.app.exception.BadRequestException;
import com.wonmally.app.security.JwtService;
import com.wonmally.app.user.entity.Role;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.RoleRepository;
import com.wonmally.app.user.repository.UserRepository;
import com.wonmally.app.user.entity.RefreshToken;
import com.wonmally.app.user.repository.RefreshTokenRepository;
import com.wonmally.app.utils.HashUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private Role citizenRole;
    private User user;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private final String dummyStringParam = "test-context-string"; // Deuxième argument factice

    @BeforeEach
    void setUp() {
        citizenRole = new Role();
        citizenRole.setId(1L);
        citizenRole.setName("CITIZEN");

        user = User.builder()
                .firstName("Jean")
                .lastName("Dupont")
                .email("jean.dupont@example.com")
                .password("encoded_password")
                .enabled(true)
                .verified(false)
                .roles(Set.of(citizenRole))
                .build();
        user.setId(UUID.randomUUID());

        registerRequest = RegisterRequest.builder()
                .firstName("Jean")
                .lastName("Dupont")
                .email("jean.dupont@example.com")
                .password("password123")
                .phone("+224600000000")
                .build();

        loginRequest = new LoginRequest("jean.dupont@example.com", "password123");
    }

    @Test
    void register_ShouldSuccess_WhenEmailDoesNotExist() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(roleRepository.findByName("CITIZEN")).thenReturn(Optional.of(citizenRole));
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encoded_password");
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("access_token");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(new RefreshToken());

        // Correction : passage du deuxième argument requis
        AuthResponse response = authService.register(registerRequest, dummyStringParam);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        assertNotNull(response.getRefreshToken());

        verify(userRepository).save(any(User.class));
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void register_ShouldThrowBadRequestException_WhenEmailAlreadyExists() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // Correction : passage du deuxième argument requis
        assertThrows(BadRequestException.class, () -> authService.register(registerRequest, dummyStringParam));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ShouldSuccess_WhenCredentialsAreValid() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("access_token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(new RefreshToken());

        // Correction : passage du deuxième argument requis
        AuthResponse response = authService.login(loginRequest, dummyStringParam);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).save(user);
    }

    @Test
    void refresh_ShouldSuccess_WhenRefreshTokenIsValid() {
        String rawToken = "valid_refresh_token";
        String tokenHash = HashUtils.sha256Hex(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .revoked(false)
                .expirationDate(LocalDateTime.now().plusDays(7))
                .build();

        RefreshTokenRequest request = new RefreshTokenRequest(rawToken);

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(refreshToken));
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("new_access_token");

        // Correction : passage du deuxième argument requis
        AuthResponse response = authService.refresh(request, dummyStringParam);

        assertNotNull(response);
        assertEquals("new_access_token", response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertNotEquals(rawToken, response.getRefreshToken());
    }

    @Test
    void refresh_ShouldThrowBadRequestException_WhenTokenIsExpired() {
        String rawToken = "expired_refresh_token";
        String tokenHash = HashUtils.sha256Hex(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .revoked(false)
                .expirationDate(LocalDateTime.now().minusDays(1))
                .build();

        RefreshTokenRequest request = new RefreshTokenRequest(rawToken);

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(refreshToken));

        // Correction : passage du deuxième argument requis
        assertThrows(BadRequestException.class, () -> authService.refresh(request, dummyStringParam));
    }

    @Test
    void logout_ShouldRevokeToken_WhenTokenExists() {
        String rawToken = "valid_refresh_token";
        String tokenHash = HashUtils.sha256Hex(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(refreshToken));

        // Correction : passage du deuxième argument requis (logout attend String, String)
        authService.logout(rawToken, dummyStringParam);

        assertTrue(refreshToken.getRevoked());
        verify(refreshTokenRepository).save(refreshToken);
    }
}