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
 * Principal Spring Security personnalise.
 *
 * Authorities contiennent a la fois les roles (ROLE_ADMIN, ROLE_CITIZEN...)
 * et les permissions granulaires (intervention:read, patient:update...).
 * Cela permet d'utiliser @PreAuthorize("hasAuthority('intervention:read')")
 * en plus du controle par role, sans aucun appel DB supplementaire.
 */
@Getter
public class CustomUserPrincipal implements UserDetails {

    private final UUID   userId;
    private final String email;
    private final String password;
    private final boolean enabled;
    private final String firstName;
    private final String lastName;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserPrincipal(User user) {
        this.userId    = user.getId();
        this.email     = user.getEmail();
        this.password  = user.getPassword();
        this.enabled   = Boolean.TRUE.equals(user.getEnabled());
        this.firstName = user.getFirstName();
        this.lastName  = user.getLastName();

        Set<GrantedAuthority> auths = new HashSet<>();
        user.getRoles().forEach(role -> {
            // Autorite de role (pour hasRole / hasAnyRole)
            auths.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            // Autorites de permission (pour hasAuthority)
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