package com.wonmally.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Active @Async pour permettre à AuditServiceImpl d'écrire les logs
 * dans un thread séparé sans bloquer la réponse auth.
 */
@Configuration
@EnableAsync
public class AppConfig {
}
