package com.wonmally.app.intervention.controller;

import com.wonmally.app.intervention.dto.CreateMedicalNoteRequestDTO;
import com.wonmally.app.intervention.dto.MedicalNoteResponseDTO;
import com.wonmally.app.intervention.service.MedicalNoteService;
import com.wonmally.app.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/medical-notes")
@RequiredArgsConstructor
@Tag(name = "Medical Notes", description = "Notes medicales liees aux interventions")
public class MedicalNoteController {

    private final MedicalNoteService medicalNoteService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalNoteResponseDTO> createNote(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @Valid @RequestBody CreateMedicalNoteRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(medicalNoteService.createNote(principal.getUserId(), dto));
    }

    @GetMapping("/by-intervention/{interventionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER', 'DOCTOR')")
    public ResponseEntity<List<MedicalNoteResponseDTO>> getByIntervention(
        @PathVariable UUID interventionId
    ) {
        return ResponseEntity.ok(medicalNoteService.getNotesByIntervention(interventionId));
    }
}