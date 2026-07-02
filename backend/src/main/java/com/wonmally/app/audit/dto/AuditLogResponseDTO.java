package com.wonmally.app.audit.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record AuditLogResponseDTO(
    UUID id,
    UUID userId,
    String userEmail,
    String action,
    String entityName,
    UUID entityId,
    String ipAddress,
    LocalDateTime createdAt
) {}