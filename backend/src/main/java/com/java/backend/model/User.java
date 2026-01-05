package com.java.backend.model;

import com.java.backend.model.enums.Role;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    /**
     * This field stores the URL for the user's avatar.
     * Since we are removing manual uploads, this will hold the UI-Avatars link.
     */
    @Column
    private String profileImageUrl;

    // AUDIT FIELDS
    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // CONSTRUCTORS
    public User() {
    }

    public User(String fullName, String email, String password, Role role) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    /**
     * JPA Lifecycle Hook: Runs automatically before a new User is saved.
     * This ensures every user has a default avatar based on their name.
     */
    @PrePersist
    protected void onCreate() {
        if (this.profileImageUrl == null && this.fullName != null) {
            String encodedName = this.fullName.replace(" ", "+");
            this.profileImageUrl = "https://ui-avatars.com/api/?name=" + encodedName;
        }
    }

    // GETTERS AND SETTERS
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }

    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }

    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }

    public void setRole(Role role) { this.role = role; }

    public String getPhoneNumber() { return phoneNumber; }

    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }

    public void setAddress(String address) { this.address = address; }

    public String getProfileImageUrl() { return profileImageUrl; }

    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public LocalDateTime getCreatedAt() { return this.createdAt; }

    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
}