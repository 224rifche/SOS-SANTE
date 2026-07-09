package com.wonmally.app.audit.mapper;

import com.wonmally.app.audit.dto.AuditLogResponseDTO;
import com.wonmally.app.audit.entity.AuditLog;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogResponseDTO toResponse(AuditLog auditLog) {
        return AuditLogResponseDTO.builder()
            .id(auditLog.getId())
            .userId(safeGetUserId(auditLog))
            .userEmail(safeGetUserEmail(auditLog))
            .action(auditLog.getAction())
            .entityName(auditLog.getEntityName())
            .entityId(auditLog.getEntityId())
            .ipAddress(auditLog.getIpAddress())
            .createdAt(auditLog.getCreatedAt())
            .build();
    }

    /**
     * Acces defensif : si l'utilisateur reference par le log a ete supprime
     * de la base (compte de test nettoye, par exemple), on evite un crash
     * et on retourne simplement null plutot que de faire echouer toute la requete.
     */
    private java.util.UUID safeGetUserId(AuditLog auditLog) {
        try {
            return auditLog.getUser() != null ? auditLog.getUser().getId() : null;
        } catch (EntityNotFoundException ex) {
            return null;
        }
    }

    private String safeGetUserEmail(AuditLog auditLog) {
        try {
            return auditLog.getUser() != null ? auditLog.getUser().getEmail() : null;
        } catch (EntityNotFoundException ex) {
            return null;
        }
    }
}