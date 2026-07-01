package com.wonmally.app.security;

import com.wonmally.app.user.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Principal Spring Security personnalisé.
 *
 * Authorities contiennent à la fois les rôles (ROLE_ADMIN, ROLE_CITIZEN…)
 * et les permissions granulaires (intervention:read, patient:update…).
 * Cela permet d'utiliser @PreAuthorize("hasAuthority('intervention:read')")
 * en plus du contrôle par rôle, sans aucun appel DB supplémentaire.
 */
@Getter
public class CustomUserPrincipal implements UserDetails {

    private final UUID   userId;
    private final String email;
    private final String password;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserPrincipal(User user) {
        this.userId   = user.getId();
        this.email    = user.getEmail();
        this.password = user.getPassword();
        this.enabled  = Boolean.TRUE.equals(user.getEnabled());

        Set<GrantedAuthority> auths = new HashSet<>();
        user.getRoles().forEach(role -> {
            // Autorité de rôle (pour hasRole / hasAnyRole)
            auths.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            // Autorités de permission (pour hasAuthority)
            role.getPermissions().forEach(perm ->
                auths.add(new SimpleGrantedAuthority(perm.getCode()))
            );
        });
        this.authorities = auths;
    }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public String  getPassword()             { return password; }
    @Override public String  getUsername()             { return email; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return enabled; }
}
