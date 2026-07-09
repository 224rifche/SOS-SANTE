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

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interventions")
@RequiredArgsConstructor
@Tag(name = "Interventions", description = "Cycle de vie complet de la prise en charge d'une urgence")
public class InterventionController {

    private final InterventionService interventionService;

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('AMBULANCIER', 'ADMIN')")
    public ResponseEntity<InterventionResponseDTO> getActiveIntervention(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.of(Objects.requireNonNull(interventionService.getActiveInterventionForUser(principal.getUserId())));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<Page<InterventionResponseDTO>> listInterventions(Pageable pageable) {
        return ResponseEntity.ok(interventionService.listInterventions(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<InterventionResponseDTO>> getMyInterventions(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(interventionService.getInterventionsForDoctor(principal.getUserId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER', 'AMBULANCIER', 'DOCTOR')")
    public ResponseEntity<InterventionResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(interventionService.getInterventionById(id));
    }

    @GetMapping("/by-alert/{alertId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InterventionResponseDTO> getByAlertId(
            @PathVariable UUID alertId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(interventionService.getInterventionByAlertIdSecured(alertId, principal));
    }

    @PatchMapping("/{id}/vitals")
    @PreAuthorize("hasAnyRole('AMBULANCIER', 'ADMIN')")
    public ResponseEntity<InterventionResponseDTO> updateVitalSigns(
            @PathVariable UUID id,
            @RequestBody com.wonmally.app.intervention.dto.VitalSignsRequestDTO dto) {
        return ResponseEntity.ok(interventionService.updateVitalSigns(id, dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER', 'AMBULANCIER', 'DOCTOR')")
    public ResponseEntity<InterventionResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody InterventionStatusUpdateRequest request) {
        return ResponseEntity.ok(interventionService.updateStatus(id, request));
    }
}