package com.wonmally.app.websocket;

import com.wonmally.app.alert.dto.AlertResponse;
import com.wonmally.app.ambulance.dto.AmbulanceResponseDTO;
import com.wonmally.app.intervention.dto.InterventionResponseDTO;
import com.wonmally.app.notification.dto.NotificationResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Diffusion temps reel des evenements critiques vers les canaux WebSocket.
 * IMPORTANT : toujours diffuser des DTOs, jamais des entites JPA brutes.
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AlertWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastNewAlert(AlertResponse alertResponse) {
        messagingTemplate.convertAndSend("/topic/alerts", alertResponse);
    }

    public void broadcastInterventionUpdate(InterventionResponseDTO interventionResponse) {
        messagingTemplate.convertAndSend("/topic/interventions", interventionResponse);
        messagingTemplate.convertAndSend(
                "/topic/interventions/" + interventionResponse.id(), interventionResponse);
    }

    public void broadcastAmbulancePosition(AmbulanceResponseDTO ambulanceResponse) {
        messagingTemplate.convertAndSend(
                "/topic/ambulances/" + ambulanceResponse.id() + "/position", ambulanceResponse);
    }

    public void broadcastNotification(UUID userId, NotificationResponseDTO notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, notification);
    }
}