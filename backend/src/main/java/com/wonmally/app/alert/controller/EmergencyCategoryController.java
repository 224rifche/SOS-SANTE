package com.wonmally.app.alert.controller;

import com.wonmally.app.alert.dto.CreateEmergencyCategoryRequestDTO;
import com.wonmally.app.alert.dto.EmergencyCategoryResponseDTO;
import com.wonmally.app.alert.dto.UpdateEmergencyCategoryRequestDTO;
import com.wonmally.app.alert.service.EmergencyCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/emergency-categories")
@RequiredArgsConstructor
@Tag(name = "Emergency Categories", description = "Gestion des categories d'urgence")
@SecurityRequirement(name = "bearerAuth")
public class EmergencyCategoryController {

    private final EmergencyCategoryService categoryService;

    @GetMapping
    @Operation(summary = "Lister toutes les categories d'urgence")
    public ResponseEntity<List<EmergencyCategoryResponseDTO>> listCategories() {
        return ResponseEntity.ok(categoryService.listCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detail d'une categorie d'urgence")
    public ResponseEntity<EmergencyCategoryResponseDTO> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Creer une categorie d'urgence")
    public ResponseEntity<EmergencyCategoryResponseDTO> createCategory(
        @Valid @RequestBody CreateEmergencyCategoryRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Modifier une categorie d'urgence")
    public ResponseEntity<EmergencyCategoryResponseDTO> updateCategory(
        @PathVariable Long id,
        @Valid @RequestBody UpdateEmergencyCategoryRequestDTO dto
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer une categorie d'urgence")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}