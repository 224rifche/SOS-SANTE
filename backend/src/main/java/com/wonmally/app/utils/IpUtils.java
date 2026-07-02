package com.wonmally.app.utils;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Extraction de l'adresse IP cliente.
 * Gère les reverse proxies (X-Forwarded-For, X-Real-IP).
 */
public final class IpUtils {

    private IpUtils() {}

    private static final String[] IP_HEADERS = {
        "X-Forwarded-For",
        "Proxy-Client-IP",
        "WL-Proxy-Client-IP",
        "HTTP_X_FORWARDED_FOR",
        "X-Real-IP"
    };

    public static String extractClientIp(HttpServletRequest request) {
        for (String header : IP_HEADERS) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For peut contenir une liste : prendre le premier
                return ip.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}
