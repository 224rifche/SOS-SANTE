package com.wonmally.app.audit.controller;

import com.wonmally.app.audit.dto.AuditLogResponseDTO;
import com.wonmally.app.audit.service.AuditLogQueryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit", description = "Consultation des journaux d'audit de securite")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogQueryService auditLogQueryService;

    @GetMapping
    public ResponseEntity<Page<AuditLogResponseDTO>> listLogs(
        @RequestParam(required = false) UUID userId,
        Pageable pageable
    ) {
        return ResponseEntity.ok(auditLogQueryService.listLogs(userId, pageable));
    }
}