package com.wonmally.app.websocket;

import com.wonmally.app.alert.dto.AlertResponse;
import com.wonmally.app.intervention.entity.Intervention;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Diffusion temps reel des evenements critiques vers les canaux WebSocket.
 * IMPORTANT : toujours diffuser des DTOs, jamais des entites JPA brutes
 * (les proxies Hibernate lazy-loaded ne sont pas serialisables en JSON).
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AlertWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastNewAlert(AlertResponse alertResponse) {
        messagingTemplate.convertAndSend("/topic/alerts", alertResponse);
    }

    public void broadcastInterventionUpdate(Intervention intervention) {
        messagingTemplate.convertAndSend("/topic/interventions", intervention);
        messagingTemplate.convertAndSend(
                "/topic/interventions/" + intervention.getId(), intervention);
    }
}