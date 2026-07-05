package com.wonmally.app.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service d'envoi d'email pour la reinitialisation de mot de passe.
 *
 * En environnement de developpement (SMTP non configure), l'envoi peut
 * echouer silencieusement ; le lien est alors trace dans les logs pour
 * permettre les tests manuels sans dependre d'un vrai serveur SMTP.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("onboarding@resend.dev");
            message.setTo(toEmail);
            message.setSubject("Wonmally - Reinitialisation de votre mot de passe");
            message.setText(
                "Bonjour,\n\n" +
                "Vous avez demande la reinitialisation de votre mot de passe Wonmally.\n" +
                "Cliquez sur le lien suivant pour choisir un nouveau mot de passe (valable 1 heure) :\n\n" +
                resetLink + "\n\n" +
                "Si vous n'etes pas a l'origine de cette demande, ignorez cet email.\n\n" +
                "L'equipe Wonmally"
            );
            mailSender.send(message);
            log.info("Email de reinitialisation envoye a {}", toEmail);
        } catch (Exception ex) {
            log.warn("Echec de l'envoi d'email a {} (SMTP non configure ?): {}", toEmail, ex.getMessage());
            log.info("[DEV] Lien de reinitialisation pour {} : {}", toEmail, resetLink);
        }
    }
}