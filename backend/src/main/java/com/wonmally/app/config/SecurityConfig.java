package com.wonmally.app.config;

import com.wonmally.app.security.filter.RateLimitFilter;
import com.wonmally.app.security.handler.CustomAccessDeniedHandler;
import com.wonmally.app.security.handler.CustomAuthEntryPoint;
import com.wonmally.app.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration centrale de Spring Security.
 *
 * Couches de securite (dans l'ordre d'execution) :
 *   1. RateLimitFilter         - anti brute-force par IP sur /auth/login
 *   2. JwtAuthenticationFilter - validation du Bearer token sur chaque requete
 *   3. SecurityFilterChain     - autorisation RBAC par URL et methode (@PreAuthorize)
 *
 * Architecture stateless (SessionCreationPolicy.STATELESS) : aucune session HTTP.
 * CORS configure sur liste blanche explicite (pas de wildcard *).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter  jwtAuthFilter;
    private final RateLimitFilter          rateLimitFilter;
    private final UserDetailsService       userDetailsService;
    private final CustomAuthEntryPoint     authEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/auth/**",
                    "/api/v1/dashboard/public-stats",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/ws/**",
                    "/actuator/health"
                ).permitAll()
                .requestMatchers("/api/v1/admin/**")
                    .hasRole("ADMIN")
                .requestMatchers("/api/v1/doctors/**")
                    .hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers("/api/v1/medical-centers/**")
                    .hasAnyRole("MEDICAL_CENTER", "ADMIN")
                .requestMatchers("/api/v1/ambulanciers/**")
                    .hasAnyRole("AMBULANCIER", "ADMIN")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(rateLimitFilter,   UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter,     UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost",
            "http://localhost:*",
            "https://*.wonmally.com"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
            "Authorization", "Content-Type", "Accept", "X-Requested-With", "Cache-Control"
        ));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}