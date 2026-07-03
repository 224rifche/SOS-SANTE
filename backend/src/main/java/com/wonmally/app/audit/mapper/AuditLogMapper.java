package com.wonmally.app.audit.mapper;

import com.wonmally.app.audit.dto.AuditLogResponseDTO;
import com.wonmally.app.audit.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogResponseDTO toResponse(AuditLog auditLog) {
        return AuditLogResponseDTO.builder()
            .id(auditLog.getId())
            .userId(auditLog.getUser() != null ? auditLog.getUser().getId() : null)
            .userEmail(auditLog.getUser() != null ? auditLog.getUser().getEmail() : null)
            .action(auditLog.getAction())
            .entityName(auditLog.getEntityName())
            .entityId(auditLog.getEntityId())
            .ipAddress(auditLog.getIpAddress())
            .createdAt(auditLog.getCreatedAt())
            .build();
    }
}