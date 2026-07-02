package com.wonmally.app.medicalcenter.controller;

import com.wonmally.app.medicalcenter.dto.*;
import com.wonmally.app.medicalcenter.service.MedicalCenterService;
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
@RequestMapping("/api/v1/medical-centers")
@RequiredArgsConstructor
@Tag(name = "Medical Centers", description = "Gestion des centres medicaux")
public class MedicalCenterController {

    private final MedicalCenterService medicalCenterService;

    @GetMapping
    public ResponseEntity<Page<MedicalCenterResponseDTO>> listCenters(
        @RequestParam(required = false) Boolean active,
        Pageable pageable
    ) {
        return ResponseEntity.ok(medicalCenterService.listCenters(active, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalCenterResponseDTO> getCenter(@PathVariable UUID id) {
        return ResponseEntity.ok(medicalCenterService.getCenterById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicalCenterResponseDTO> createCenter(
        @Valid @RequestBody CreateMedicalCenterRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicalCenterService.createCenter(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicalCenterResponseDTO> updateCenter(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateMedicalCenterRequestDTO dto
    ) {
        return ResponseEntity.ok(medicalCenterService.updateCenter(id, dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicalCenterResponseDTO> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateMedicalCenterStatusRequestDTO dto
    ) {
        return ResponseEntity.ok(medicalCenterService.updateStatus(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCenter(@PathVariable UUID id) {
        medicalCenterService.deleteCenter(id);
        return ResponseEntity.noContent().build();
    }
}