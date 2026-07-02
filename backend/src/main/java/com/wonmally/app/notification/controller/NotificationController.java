package com.wonmally.app.notification.controller;

import com.wonmally.app.notification.dto.NotificationResponseDTO;
import com.wonmally.app.notification.service.NotificationService;
import com.wonmally.app.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notifications personnelles de l'utilisateur")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponseDTO>> myNotifications(
        @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(principal.getUserId()));
    }

    @GetMapping("/me/unread")
    public ResponseEntity<List<NotificationResponseDTO>> myUnreadNotifications(
        @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return ResponseEntity.ok(notificationService.getMyUnreadNotifications(principal.getUserId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(id, principal.getUserId()));
    }
}