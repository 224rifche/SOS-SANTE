package com.wonmally.app.doctor.controller;

import com.wonmally.app.doctor.dto.*;
import com.wonmally.app.doctor.service.DoctorService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Gestion des medecins")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<Page<DoctorResponseDTO>> listDoctors(Pageable pageable) {
        return ResponseEntity.ok(doctorService.listDoctors(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> myProfile(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(doctorService.getMyProfile(principal.getUserId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_CENTER')")
    public ResponseEntity<DoctorResponseDTO> getDoctor(@PathVariable UUID id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorResponseDTO> createDoctor(
            @Valid @RequestBody CreateDoctorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.createDoctor(dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDoctorStatusRequestDTO dto) {
        return ResponseEntity.ok(doctorService.updateStatus(id, dto));
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<DoctorResponseDTO> updateAvailability(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDoctorAvailabilityRequestDTO dto) {
        return ResponseEntity.ok(doctorService.updateAvailability(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable UUID id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}