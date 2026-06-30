package com.wonmally.app.intervention.controller;

import com.wonmally.app.intervention.dto.InterventionStatusUpdateRequest;
import com.wonmally.app.intervention.entity.Intervention;
import com.wonmally.app.intervention.service.InterventionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interventions")
@RequiredArgsConstructor
@Tag(name = "Interventions", description = "Cycle de vie complet de la prise en charge d'une urgence")
public class InterventionController {

    private final InterventionService interventionService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<Intervention> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody InterventionStatusUpdateRequest request) {
        return ResponseEntity.ok(interventionService.updateStatus(id, request));
    }
}
