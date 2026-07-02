package com.wonmally.app.geolocation.service;

import com.wonmally.app.geolocation.dto.*;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class GeolocationService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    public DistanceResponseDTO calculateDistance(DistanceRequestDTO request) {
        double distanceKm = haversine(
            request.origin().latitude().doubleValue(),
            request.origin().longitude().doubleValue(),
            request.destination().latitude().doubleValue(),
            request.destination().longitude().doubleValue()
        );

        return DistanceResponseDTO.builder()
            .distanceKm(round(distanceKm))
            .unit("km")
            .build();
    }

    public List<NearbyResultDTO> findNearby(NearbyRequestDTO request) {
        double refLat = request.reference().latitude().doubleValue();
        double refLon = request.reference().longitude().doubleValue();

        List<NearbyResultDTO> results = request.candidates().stream()
            .map(candidate -> NearbyResultDTO.builder()
                .id(candidate.id())
                .distanceKm(round(haversine(
                    refLat, refLon,
                    candidate.coordinates().latitude().doubleValue(),
                    candidate.coordinates().longitude().doubleValue()
                )))
                .build())
            .sorted(Comparator.comparingDouble(NearbyResultDTO::distanceKm))
            .toList();

        int limit = (request.maxResults() != null && request.maxResults() > 0)
            ? request.maxResults()
            : results.size();

        return results.stream().limit(limit).toList();
    }

    /**
     * Formule de Haversine : calcule la distance a vol d'oiseau entre deux
     * points GPS, en tenant compte de la courbure de la Terre.
     */
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}