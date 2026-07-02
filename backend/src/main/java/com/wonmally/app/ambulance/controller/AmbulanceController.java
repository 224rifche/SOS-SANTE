package com.wonmally.app.ambulance.controller;

import com.wonmally.app.ambulance.dto.*;
import com.wonmally.app.ambulance.service.AmbulanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ambulances")
@RequiredArgsConstructor
@Tag(name = "Ambulances", description = "Gestion des ambulances")
public class AmbulanceController {

    private final AmbulanceService ambulanceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER', 'AMBULANCIER')")
    public ResponseEntity<Page<AmbulanceResponseDTO>> listAmbulances(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) UUID medicalCenterId,
        Pageable pageable
    ) {
        return ResponseEntity.ok(ambulanceService.listAmbulances(status, medicalCenterId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER', 'AMBULANCIER')")
    public ResponseEntity<AmbulanceResponseDTO> getAmbulance(@PathVariable UUID id) {
        return ResponseEntity.ok(ambulanceService.getAmbulanceById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<AmbulanceResponseDTO> createAmbulance(
        @Valid @RequestBody CreateAmbulanceRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ambulanceService.createAmbulance(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<AmbulanceResponseDTO> updateAmbulance(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateAmbulanceRequestDTO dto
    ) {
        return ResponseEntity.ok(ambulanceService.updateAmbulance(id, dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER', 'AMBULANCIER')")
    public ResponseEntity<AmbulanceResponseDTO> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateAmbulanceStatusRequestDTO dto
    ) {
        return ResponseEntity.ok(ambulanceService.updateStatus(id, dto));
    }

    @PatchMapping("/{id}/position")
    @PreAuthorize("hasRole('AMBULANCIER')")
    public ResponseEntity<AmbulanceResponseDTO> updatePosition(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateAmbulancePositionRequestDTO dto
    ) {
        return ResponseEntity.ok(ambulanceService.updatePosition(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAmbulance(@PathVariable UUID id) {
        ambulanceService.deleteAmbulance(id);
        return ResponseEntity.noContent().build();
    }
}