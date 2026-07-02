package com.wonmally.app.notification.service;

import com.wonmally.app.exception.ResourceNotFoundException;
import com.wonmally.app.notification.dto.NotificationResponseDTO;
import com.wonmally.app.notification.entity.Notification;
import com.wonmally.app.notification.mapper.NotificationMapper;
import com.wonmally.app.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper mapper;

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
}