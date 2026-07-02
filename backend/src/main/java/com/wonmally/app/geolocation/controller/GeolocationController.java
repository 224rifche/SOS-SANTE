package com.wonmally.app.geolocation.controller;

import com.wonmally.app.geolocation.dto.DistanceRequestDTO;
import com.wonmally.app.geolocation.dto.DistanceResponseDTO;
import com.wonmally.app.geolocation.dto.NearbyRequestDTO;
import com.wonmally.app.geolocation.dto.NearbyResultDTO;
import com.wonmally.app.geolocation.service.GeolocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/geolocation")
@RequiredArgsConstructor
@Tag(name = "Geolocation", description = "Utilitaires de calcul de distance et de proximite")
@SecurityRequirement(name = "bearerAuth")
public class GeolocationController {

    private final GeolocationService geolocationService;

    @PostMapping("/distance")
    @Operation(summary = "Calculer la distance entre deux points GPS (formule de Haversine)")
    public ResponseEntity<DistanceResponseDTO> calculateDistance(
        @Valid @RequestBody DistanceRequestDTO request
    ) {
        return ResponseEntity.ok(geolocationService.calculateDistance(request));
    }

    @PostMapping("/nearby")
    @Operation(summary = "Trier une liste de points par proximite avec un point de reference")
    public ResponseEntity<List<NearbyResultDTO>> findNearby(
        @Valid @RequestBody NearbyRequestDTO request
    ) {
        return ResponseEntity.ok(geolocationService.findNearby(request));
    }
}