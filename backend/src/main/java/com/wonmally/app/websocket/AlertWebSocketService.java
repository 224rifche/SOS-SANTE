package com.wonmally.app.websocket;

import com.wonmally.app.alert.entity.Alert;
import com.wonmally.app.intervention.entity.Intervention;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Diffusion temps reel des evenements critiques vers les canaux WebSocket.
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AlertWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastNewAlert(Alert alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }

    public void broadcastInterventionUpdate(Intervention intervention) {
        messagingTemplate.convertAndSend("/topic/interventions", intervention);
        messagingTemplate.convertAndSend(
                "/topic/interventions/" + intervention.getId(), intervention);
    }
}
