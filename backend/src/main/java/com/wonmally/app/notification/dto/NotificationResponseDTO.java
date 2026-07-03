package com.wonmally.app.notification.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record NotificationResponseDTO(
    UUID id,
    String title,
    String message,
    String type,
    Boolean isRead,
    LocalDateTime createdAt
) {}