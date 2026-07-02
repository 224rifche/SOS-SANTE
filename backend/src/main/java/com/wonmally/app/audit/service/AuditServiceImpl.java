package com.wonmally.app.audit.service;

import com.wonmally.app.audit.entity.AuditLog;
import com.wonmally.app.audit.repository.AuditLogRepository;
import com.wonmally.app.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Implementation asynchrone de l'audit.
 *
 * @Async : l'ecriture en DB se fait dans un thread separe.
 * Propagation.REQUIRES_NEW : l'audit survit a un rollback du service appelant.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuditServiceImpl implements AuditService {

    private static final String ENTITY_AUTH = "AUTH";

    private final AuditLogRepository auditLogRepository;

    @Async
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAuthEvent(String action, User user, String ipAddress) {
        try {
            AuditLog log = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityName(ENTITY_AUTH)
                    .entityId(user.getId())
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Echec de l'ecriture du log d'audit pour action={} userId={}: {}",
                    action, user.getId(), e.getMessage());
        }
    }

    @Async
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAuthEventAnonymous(String action, String detail, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .user(null)
                    .action(action + (detail != null ? ":" + detail : ""))
                    .entityName(ENTITY_AUTH)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Echec de l'ecriture du log d'audit anonyme pour action={}: {}",
                    action, e.getMessage());
        }
    }

    @Async
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String action, User user, String entityName, UUID entityId) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityName(entityName)
                    .entityId(entityId)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Echec de l'ecriture du log d'audit pour action={} entity={} entityId={}: {}",
                    action, entityName, entityId, e.getMessage());
        }
    }
}