package com.wonmally.app.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wonmally.app.auth.dto.*;
import com.wonmally.app.auth.service.AuthService;
import com.wonmally.app.security.JwtAuthenticationFilter;
import com.wonmally.app.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void register_ShouldReturnCreated_WhenPayloadIsValid() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Jean")
                .lastName("Dupont")
                .email("jean.dupont@example.com")
                .password("password123")
                .build();

        doNothing().when(authService).register(any(RegisterRequest.class), any(String.class));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        verify(authService).register(any(RegisterRequest.class), any(String.class));
    }

    @Test
    void register_ShouldReturnBadRequest_WhenEmailIsInvalid() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Jean")
                .lastName("Dupont")
                .email("invalid-email")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
    @Test
    void login_ShouldReturnOk_WhenPayloadIsValid() throws Exception {
        LoginRequest request = new LoginRequest("jean.dupont@example.com", "password123", false);

        AuthResponse response = AuthResponse.builder()
                .accessToken("access_token")
                .refreshToken("refresh_token")
                .tokenType("Bearer")
                .build();

        // Correction : ajout de any(String.class)
        when(authService.login(any(LoginRequest.class), any(String.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access_token"));

        // Correction : ajout du matcher manquant
        verify(authService).login(any(LoginRequest.class), any(String.class));
    }

    @Test
    void refresh_ShouldReturnOk_WhenPayloadIsValid() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh_token");

        AuthResponse response = AuthResponse.builder()
                .accessToken("new_access_token")
                .refreshToken("refresh_token")
                .tokenType("Bearer")
                .build();

        // Correction : ajout de any(String.class)
        when(authService.refresh(any(RefreshTokenRequest.class), any(String.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new_access_token"));

        // Correction : ajout du matcher manquant
        verify(authService).refresh(any(RefreshTokenRequest.class), any(String.class));
    }

    @Test
    void logout_ShouldReturnNoContent_WhenPayloadIsValid() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh_token");

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        // Correction : logout attend (String, String) maintenant au lieu d'un seul argument
        verify(authService).logout(anyString(), anyString());
    }
}
