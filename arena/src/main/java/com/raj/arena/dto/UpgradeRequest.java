package com.raj.arena.dto;

public class UpgradeRequest {
    private Long guestId;
    private String name;
    private String username;
    private String email;
    private String password;

    public Long getGuestId() {
        return guestId;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}
