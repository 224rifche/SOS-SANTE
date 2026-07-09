package com.wonmally.app.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service d'envoi d'email via serveur SMTP (Brevo SMTP relay).
 *
 * En environnement de developpement (SMTP non configure ou echec
 * d'authentification), l'envoi peut echouer silencieusement ; le code
 * est alors trace dans les logs pour permettre les tests manuels.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@wonmally.com}")
    private String fromAddress;

    public void sendPasswordResetEmail(String toEmail, String resetCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Wonmally - Votre code de reinitialisation");
            message.setText(
                "Bonjour,\n\n" +
                "Vous avez demande la reinitialisation de votre mot de passe Wonmally.\n" +
                "Voici votre code de reinitialisation (valable 1 heure) :\n\n" +
                "    " + resetCode + "\n\n" +
                "Saisissez ce code dans l'application pour choisir un nouveau mot de passe.\n\n" +
                "Si vous n'etes pas a l'origine de cette demande, ignorez cet email.\n\n" +
                "L'equipe Wonmally"
            );
            mailSender.send(message);
            log.info("Email de reinitialisation envoye a {}", toEmail);
        } catch (Exception ex) {
            log.warn("Echec de l'envoi d'email a {} (SMTP non configure ?): {}", toEmail, ex.getMessage());
            log.info("[DEV] Code de reinitialisation pour {} : {}", toEmail, resetCode);
        }
    }

    public void sendVerificationEmail(String toEmail, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Wonmally - Votre code de verification");
            message.setText(
                "Bonjour,\n\n" +
                "Merci de vous etre inscrit sur Wonmally.\n" +
                "Voici votre code de verification (valable 24 heures) :\n\n" +
                "    " + verificationCode + "\n\n" +
                "Saisissez ce code dans l'application pour activer votre compte.\n\n" +
                "Si vous n'etes pas a l'origine de cette inscription, ignorez cet email.\n\n" +
                "L'equipe Wonmally"
            );
            mailSender.send(message);
            log.info("Email de verification envoye a {}", toEmail);
        } catch (Exception ex) {
            log.warn("Echec de l'envoi d'email de verification a {}: {}", toEmail, ex.getMessage());
            log.info("[DEV] Code de verification pour {} : {}", toEmail, verificationCode);
        }
    }

    /**
     * Envoie un email personnalise (utilise par le medecin depuis son dashboard).
     */
    public void sendCustomEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}