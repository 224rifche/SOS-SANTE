package com.wonmally.app.ambulancier.controller;

import com.wonmally.app.ambulancier.dto.*;
import com.wonmally.app.ambulancier.service.AmbulancierService;
import com.wonmally.app.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ambulanciers")
@RequiredArgsConstructor
@Tag(name = "Ambulanciers", description = "Gestion des ambulanciers")
public class AmbulancierController {

    private final AmbulancierService ambulancierService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<Page<AmbulancierResponseDTO>> listAmbulanciers(Pageable pageable) {
        return ResponseEntity.ok(ambulancierService.listAmbulanciers(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('AMBULANCIER')")
    public ResponseEntity<AmbulancierResponseDTO> myProfile(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ambulancierService.getMyProfile(principal.getUserId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<AmbulancierResponseDTO> getAmbulancier(@PathVariable UUID id) {
        return ResponseEntity.ok(ambulancierService.getAmbulancierById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AmbulancierResponseDTO> createAmbulancier(
        @Valid @RequestBody CreateAmbulancierRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ambulancierService.createAmbulancier(dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AMBULANCIER')")
    public ResponseEntity<AmbulancierResponseDTO> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateAmbulancierStatusRequestDTO dto
    ) {
        return ResponseEntity.ok(ambulancierService.updateStatus(id, dto));
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'AMBULANCIER')")
    public ResponseEntity<AmbulancierResponseDTO> updateAvailability(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateAmbulancierAvailabilityRequestDTO dto
    ) {
        return ResponseEntity.ok(ambulancierService.updateAvailability(id, dto));
    }

    @PatchMapping("/{id}/vehicle")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<AmbulancierResponseDTO> assignVehicle(
        @PathVariable UUID id,
        @RequestBody Map<String, UUID> body
    ) {
        return ResponseEntity.ok(ambulancierService.assignVehicle(id, body.get("ambulanceId")));
    }
}