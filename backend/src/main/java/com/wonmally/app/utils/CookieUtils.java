package com.wonmally.app.utils;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

/**
 * Utilitaire de creation des cookies httpOnly pour les tokens JWT.
 *
 * SameSite=None + Secure sont necessaires car le frontend (localhost:5173)
 * et le backend (localhost:8080) sont consideres comme des origines
 * differentes (ports differents) par le navigateur. Chrome autorise
 * Secure sur localhost meme en HTTP (exception "secure context").
 *
 * "Se souvenir de moi" pilote la duree de vie du cookie :
 *  - true  -> cookie persistant (survit a la fermeture du navigateur)
 *  - false -> cookie de session (supprime a la fermeture du navigateur)
 */
public final class CookieUtils {

    public static final String ACCESS_TOKEN_COOKIE  = "wonmally_access_token";
    public static final String REFRESH_TOKEN_COOKIE = "wonmally_refresh_token";

    private CookieUtils() {
    }

    public static void addAccessTokenCookie(HttpServletResponse response, String token,
                                             boolean rememberMe, int accessTokenMaxAgeSeconds) {
        addCookie(response, ACCESS_TOKEN_COOKIE, token, rememberMe, accessTokenMaxAgeSeconds);
    }

    public static void addRefreshTokenCookie(HttpServletResponse response, String token,
                                              boolean rememberMe, int refreshTokenMaxAgeSeconds) {
        addCookie(response, REFRESH_TOKEN_COOKIE, token, rememberMe, refreshTokenMaxAgeSeconds);
    }

    public static void clearAuthCookies(HttpServletResponse response) {
        addCookie(response, ACCESS_TOKEN_COOKIE, "", false, 0);
        addCookie(response, REFRESH_TOKEN_COOKIE, "", false, 0);
    }

    private static void addCookie(HttpServletResponse response, String name, String value,
                                   boolean rememberMe, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(rememberMe ? maxAgeSeconds : -1)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}