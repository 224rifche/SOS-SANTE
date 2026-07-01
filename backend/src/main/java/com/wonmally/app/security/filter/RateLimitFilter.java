package com.wonmally.app.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wonmally.app.utils.IpUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Protection contre les attaques par force brute sur l'endpoint /auth/login.
 *
 * Règle : MAX_ATTEMPTS tentatives par WINDOW_MINUTES minutes par adresse IP.
 * Implémentation in-memory (ConcurrentHashMap). Pour la production avec plusieurs
 * instances, remplacer par un stockage Redis via Spring Cache.
 *
 * Note : le verrou au niveau applicatif (User.lockedUntil) est une deuxième couche
 * de protection gérée dans AuthService, indépendante de ce filtre IP.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${wonmally.security.rate-limit.max-attempts:10}")
    private int maxAttempts;

    @Value("${wonmally.security.rate-limit.window-minutes:15}")
    private int windowMinutes;

    private static final String LOGIN_PATH = "/api/v1/auth/login";

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final ConcurrentHashMap<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        if (!LOGIN_PATH.equals(request.getRequestURI()) || !"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = IpUtils.extractClientIp(request);
        AttemptInfo info = attempts.compute(clientIp, (ip, existing) -> {
            if (existing == null || existing.isExpired(windowMinutes)) {
                return new AttemptInfo();
            }
            return existing;
        });

        if (info.getCount() >= maxAttempts) {
            sendTooManyRequestsResponse(response, request.getRequestURI());
            return;
        }

        info.increment();
        filterChain.doFilter(request, response);
    }

    private void sendTooManyRequestsResponse(HttpServletResponse response, String path) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status",    429,
                "error",     "Too Many Requests",
                "message",   String.format(
                        "Trop de tentatives de connexion. Veuillez réessayer dans %d minutes.", windowMinutes),
                "path",      path
        );
        MAPPER.writeValue(response.getOutputStream(), body);
    }

    // -------------------------------------------------------------------------
    // Inner class — compteur par IP
    // -------------------------------------------------------------------------

    private static final class AttemptInfo {
        private final AtomicInteger count = new AtomicInteger(0);
        private final long windowStart = System.currentTimeMillis();

        int getCount() { return count.get(); }
        void increment() { count.incrementAndGet(); }

        boolean isExpired(int windowMinutes) {
            long elapsed = System.currentTimeMillis() - windowStart;
            return elapsed > (long) windowMinutes * 60 * 1000;
        }
    }
}
