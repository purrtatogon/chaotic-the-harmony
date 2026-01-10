package com.java.backend.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

// This class adapts my custom 'User' entity to Spring Security's 'UserDetails' interface.
public class UserPrincipal implements UserDetails {

    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // FIX: Spring Security requires the "ROLE_" prefix for hasRole() to work
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }

    @Override
    public String getPassword() {
        return user.getPassword(); // Returns the hashed password
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // We use Email as the unique username
    }

    // Standard Spring Security boilerplate (returning true means the account is active)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // New helper method to access the entity's full name
    public String getFullName() {
        return user.getFullName();
    }
}