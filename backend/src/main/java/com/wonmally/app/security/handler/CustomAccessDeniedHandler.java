package com.wonmally.app.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Répond 403 Forbidden avec un corps JSON structuré.
 * Déclenché quand un utilisateur authentifié accède à une ressource
 * pour laquelle il n'a pas les droits nécessaires.
 */
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status",    403,
                "error",     "Forbidden",
                "message",   "Accès refusé. Vous n'avez pas les droits nécessaires.",
                "path",      request.getRequestURI()
        );
        MAPPER.writeValue(response.getOutputStream(), body);
    }
}
