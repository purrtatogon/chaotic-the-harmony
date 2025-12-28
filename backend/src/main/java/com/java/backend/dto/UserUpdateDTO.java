package com.java.backend.dto;

public class UserUpdateDTO {
    private String fullName;
    private String phoneNumber;
    private String department;
    private String profileImageUrl;
    private String address;

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}