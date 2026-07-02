package com.wonmally.app.notification.service;

import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.notification.dto.NotificationResponseDTO;
import com.wonmally.app.notification.entity.Notification;
import com.wonmally.app.notification.mapper.NotificationMapper;
import com.wonmally.app.notification.repository.NotificationRepository;
import com.wonmally.app.user.entity.User;
import com.wonmally.app.user.repository.UserRepository;
import com.wonmally.app.websocket.AlertWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper mapper;
    private final AlertWebSocketService webSocketService;

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getMyNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(mapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getMyUnreadNotifications(UUID userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
            .map(mapper::toResponse)
            .toList();
    }

    @Transactional
    public NotificationResponseDTO markAsRead(UUID notificationId, UUID requestingUserId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable"));

        if (!notification.getUser().getId().equals(requestingUserId)) {
            throw new ResourceNotFoundException("Notification introuvable");
        }

        notification.setIsRead(true);
        return mapper.toResponse(notificationRepository.save(notification));
    }

    /**
     * Cree une notification pour un utilisateur et la diffuse en temps reel
     * via WebSocket. Utilise en interne par les autres services metier
     * (Alertes, Interventions) pour tenir le citoyen informe.
     */
    @Transactional
    public void notifyUser(UUID userId, String title, String message, String type) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return;
            }

            Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

            Notification saved = notificationRepository.save(notification);
            NotificationResponseDTO response = mapper.toResponse(saved);
            webSocketService.broadcastNotification(userId, response);
        } catch (Exception ignored) {
            // Une notification manquee ne doit jamais casser le flux principal
        }
    }
}