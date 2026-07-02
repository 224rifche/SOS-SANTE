package com.wonmally.app.notification.mapper;

import com.wonmally.app.notification.dto.NotificationResponseDTO;
import com.wonmally.app.notification.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponseDTO toResponse(Notification notification) {
        return NotificationResponseDTO.builder()
            .id(notification.getId())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .type(notification.getType())
            .isRead(notification.getIsRead())
            .createdAt(notification.getCreatedAt())
            .build();
    }
}