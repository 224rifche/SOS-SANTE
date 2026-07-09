package com.wonmally.app.user.controller;

import com.wonmally.app.user.dto.*;
import com.wonmally.app.user.service.UserAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Admin", description = "Gestion administrative des comptes utilisateurs")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {

    private final UserAdminService userAdminService;

    @GetMapping
    @Operation(summary = "Lister les utilisateurs (pagine, filtrable)")
    public ResponseEntity<Page<UserAdminResponseDTO>> listUsers(
        @RequestParam(required = false) String role,
        @RequestParam(required = false) Boolean enabled,
        @RequestParam(required = false) String search,
        Pageable pageable
    ) {
        return ResponseEntity.ok(userAdminService.listUsers(role, enabled, search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detail d'un utilisateur")
    public ResponseEntity<UserAdminResponseDTO> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userAdminService.getUserById(id));
    }

    @PostMapping
    @Operation(summary = "Creer un utilisateur")
    public ResponseEntity<UserAdminResponseDTO> createUser(@Valid @RequestBody CreateUserRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userAdminService.createUser(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier les informations de base d'un utilisateur")
    public ResponseEntity<UserAdminResponseDTO> updateUser(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateUserRequestDTO dto
    ) {
        return ResponseEntity.ok(userAdminService.updateUser(id, dto));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Activer ou desactiver un utilisateur")
    public ResponseEntity<UserAdminResponseDTO> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateUserStatusRequestDTO dto
    ) {
        return ResponseEntity.ok(userAdminService.updateStatus(id, dto));
    }

    @PatchMapping("/{id}/roles")
    @Operation(summary = "Modifier les roles d'un utilisateur")
    public ResponseEntity<UserAdminResponseDTO> updateRoles(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateUserRolesRequestDTO dto
    ) {
        return ResponseEntity.ok(userAdminService.updateRoles(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un utilisateur")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userAdminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}