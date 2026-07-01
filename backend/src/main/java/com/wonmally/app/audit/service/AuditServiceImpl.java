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

/**
 * Implémentation asynchrone de l'audit.
 *
 * @Async : l'écriture en DB se fait dans un thread séparé — la réponse auth
 *          n'est pas bloquée par la persistence du log.
 *
 * Propagation.REQUIRES_NEW : l'audit survit à un rollback du service appelant
 *          (ex : échec de login → on logue quand même l'événement).
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
            log.error("Échec de l'écriture du log d'audit pour action={} userId={}: {}",
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
            log.error("Échec de l'écriture du log d'audit anonyme pour action={}: {}",
                    action, e.getMessage());
        }
    }
}
