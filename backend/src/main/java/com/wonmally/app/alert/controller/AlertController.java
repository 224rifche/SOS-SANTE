package com.wonmally.app.alert.controller;

import com.wonmally.app.alert.dto.AlertRequest;
import com.wonmally.app.alert.dto.AlertResponse;
import com.wonmally.app.alert.service.AlertService;
import com.wonmally.app.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alertes", description = "Declenchement et suivi des alertes SOS")
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<AlertResponse> create(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody AlertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(alertService.createAlert(principal.getUserId(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AlertResponse>> myAlerts(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(alertService.getAlertsByCitizen(principal.getUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }
}
