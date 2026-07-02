package com.wonmally.app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

/**
 * Génération et validation des Access Token JWT.
 * Les claims embarqués (userId, roles, permissions) évitent une lecture DB
 * supplémentaire dans le filtre d'authentification.
 * Durée de vie : 15 minutes (configurable via application.yml).
 */
@Service
@SuppressWarnings("null")
public class JwtService {

    private static final String CLAIM_USER_ID     = "userId";
    private static final String CLAIM_ROLES        = "roles";
    private static final String CLAIM_PERMISSIONS  = "permissions";

    @Value("${wonmally.security.jwt.secret}")
    private String secretKey;

    @Value("${wonmally.security.jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;

    // -------------------------------------------------------------------------
    // Génération
    // -------------------------------------------------------------------------

    public String generateToken(UserDetails userDetails) {
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .toList();

        List<String> permissions = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.startsWith("ROLE_"))
                .toList();

        String userId = (userDetails instanceof CustomUserPrincipal p)
                ? p.getUserId().toString()
                : null;

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim(CLAIM_USER_ID, userId)
                .claim(CLAIM_ROLES, roles)
                .claim(CLAIM_PERMISSIONS, permissions)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
                .signWith(getSignInKey())
                .compact();
    }

    // -------------------------------------------------------------------------
    // Extraction des claims
    // -------------------------------------------------------------------------

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public UUID extractUserId(String token) {
        String id = extractClaim(token, claims -> claims.get(CLAIM_USER_ID, String.class));
        return id != null ? UUID.fromString(id) : null;
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return extractClaim(token, claims -> (List<String>) claims.get(CLAIM_ROLES));
    }

    @SuppressWarnings("unchecked")
    public List<String> extractPermissions(String token) {
        return extractClaim(token, claims -> (List<String>) claims.get(CLAIM_PERMISSIONS));
    }

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // -------------------------------------------------------------------------
    // Helpers privés
    // -------------------------------------------------------------------------

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = secretKey.getBytes();
        if (keyBytes.length < 64) {
            throw new IllegalStateException(
                "JWT secret must be at least 512 bits (64 bytes). Check wonmally.security.jwt.secret.");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
