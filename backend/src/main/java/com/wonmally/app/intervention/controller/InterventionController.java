package com.wonmally.app.intervention.controller;

import com.wonmally.app.intervention.dto.InterventionResponseDTO;
import com.wonmally.app.intervention.dto.InterventionStatusUpdateRequest;
import com.wonmally.app.intervention.service.InterventionService;
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
@RequestMapping("/api/v1/interventions")
@RequiredArgsConstructor
@Tag(name = "Interventions", description = "Cycle de vie complet de la prise en charge d'une urgence")
public class InterventionController {

    private final InterventionService interventionService;

    @GetMapping("/active")
    @PreAuthorize("hasRole('AMBULANCIER')")
    public ResponseEntity<InterventionResponseDTO> getActiveIntervention(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.of(interventionService.getActiveInterventionForUser(principal.getUserId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<Page<InterventionResponseDTO>> listInterventions(Pageable pageable) {
        return ResponseEntity.ok(interventionService.listInterventions(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER', 'AMBULANCIER', 'DOCTOR')")
    public ResponseEntity<InterventionResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(interventionService.getInterventionById(id));
    }

    @GetMapping("/by-alert/{alertId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER', 'AMBULANCIER', 'DOCTOR')")
    public ResponseEntity<InterventionResponseDTO> getByAlertId(@PathVariable UUID alertId) {
        return ResponseEntity.ok(interventionService.getInterventionByAlertId(alertId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER', 'AMBULANCIER', 'DOCTOR')")
    public ResponseEntity<InterventionResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody InterventionStatusUpdateRequest request) {
        return ResponseEntity.ok(interventionService.updateStatus(id, request));
    }
}