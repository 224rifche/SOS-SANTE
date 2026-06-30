package com.wonmally.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Won-Mally - Plateforme intelligente de gestion des urgences medicales.
 * Point d'entree de l'application Spring Boot.
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class WonmallyApplication {

    public static void main(String[] args) {
        SpringApplication.run(WonmallyApplication.class, args);
    }
}
