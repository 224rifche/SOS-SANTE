package com.wonmally.app.citizen.controller;

import com.wonmally.app.citizen.dto.CitizenProfileResponseDTO;
import com.wonmally.app.citizen.dto.UpdateCitizenProfileRequestDTO;
import com.wonmally.app.citizen.service.CitizenService;
import com.wonmally.app.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/citizens")
@RequiredArgsConstructor
@Tag(name = "Citizens", description = "Profil du citoyen connecte")
public class CitizenController {

    private final CitizenService citizenService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<CitizenProfileResponseDTO> getMyProfile(
        @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return ResponseEntity.ok(citizenService.getMyProfile(principal.getUserId()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<CitizenProfileResponseDTO> updateMyProfile(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @Valid @RequestBody UpdateCitizenProfileRequestDTO dto
    ) {
        return ResponseEntity.ok(citizenService.updateMyProfile(principal.getUserId(), dto));
    }
}