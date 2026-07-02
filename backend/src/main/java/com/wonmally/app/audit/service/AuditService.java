package com.wonmally.app.audit.service;

import com.wonmally.app.user.entity.User;

import java.util.UUID;

/**
 * Contrat de journalisation des evenements de securite et des actions
 * metier sensibles. Les implementations doivent ecrire de maniere
 * asynchrone pour ne pas impacter la latence des endpoints.
 */
public interface AuditService {

    void logAuthEvent(String action, User user, String ipAddress);

    void logAuthEventAnonymous(String action, String detail, String ipAddress);

    void logAction(String action, User user, String entityName, UUID entityId);
}