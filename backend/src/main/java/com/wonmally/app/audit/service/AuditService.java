package com.wonmally.app.audit.service;

import com.wonmally.app.user.entity.User;

/**
 * Contrat de journalisation des événements de sécurité.
 * Les implémentations doivent écrire de manière asynchrone pour ne pas
 * impacter la latence des endpoints d'authentification.
 */
public interface AuditService {

    void logAuthEvent(String action, User user, String ipAddress);

    void logAuthEventAnonymous(String action, String detail, String ipAddress);
}
