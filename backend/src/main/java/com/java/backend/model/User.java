package com.java.backend.model;

import com.java.backend.model.enums.Role;
import jakarta.persistence.*;

@Entity
@Table(name = "app_user") // <--- bc 'user' is a reserved keyword in postgres
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

    @Column
    private String profileImageUrl; // Stores the Cloudinary URL

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Client-specific attributes (will be null for admin users)
    @Column
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String address;


    // CONSTRUCTORS
    // Default
    public User() {
    }

    // For Admin/Staff creation
    public User(String fullName, String email, String password, Role role, String profileImageUrl) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.profileImageUrl = profileImageUrl;
    }


    // GETTERS and SETTERS
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

}
