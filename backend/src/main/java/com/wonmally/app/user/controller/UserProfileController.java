package com.wonmally.app.user.controller;

import com.wonmally.app.security.CustomUserPrincipal;
import com.wonmally.app.user.dto.ChangePasswordRequestDTO;
import com.wonmally.app.user.dto.UpdateProfileRequestDTO;
import com.wonmally.app.user.dto.UserProfileResponseDTO;
import com.wonmally.app.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Gestion du profil de l'utilisateur connecte")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    @Operation(summary = "Recuperer le profil de l'utilisateur connecte")
    public ResponseEntity<UserProfileResponseDTO> getProfile(
        @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return ResponseEntity.ok(userProfileService.getCurrentProfile(principal.getUserId()));
    }

    @PutMapping
    @Operation(summary = "Mettre a jour le profil de l'utilisateur connecte")
    public ResponseEntity<UserProfileResponseDTO> updateProfile(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @Valid @RequestBody UpdateProfileRequestDTO dto
    ) {
        return ResponseEntity.ok(userProfileService.updateProfile(principal.getUserId(), dto));
    }

    @PatchMapping("/password")
    @Operation(summary = "Changer le mot de passe de l'utilisateur connecte")
    public ResponseEntity<Void> changePassword(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @Valid @RequestBody ChangePasswordRequestDTO dto
    ) {
        userProfileService.changePassword(principal.getUserId(), dto);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
