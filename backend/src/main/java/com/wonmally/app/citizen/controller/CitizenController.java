package com.wonmally.app.citizen.controller;

import com.wonmally.app.citizen.dto.CitizenProfileResponseDTO;
import com.wonmally.app.citizen.dto.UpdateCitizenProfileRequestDTO;
import com.wonmally.app.citizen.service.CitizenService;
import com.wonmally.app.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/citizens")
@RequiredArgsConstructor
@Tag(name = "Citizens", description = "Profil du citoyen connecte et supervision admin")
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

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<Page<CitizenProfileResponseDTO>> listCitizens(Pageable pageable) {
        return ResponseEntity.ok(citizenService.listCitizens(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<CitizenProfileResponseDTO> getCitizenById(@PathVariable UUID id) {
        return ResponseEntity.ok(citizenService.getCitizenById(id));
    }
}