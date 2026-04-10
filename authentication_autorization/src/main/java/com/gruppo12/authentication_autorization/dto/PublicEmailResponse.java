package com.gruppo12.authentication_autorization.dto;

public class PublicEmailResponse {

    private String username;
    private String email;

    public PublicEmailResponse() {
    }

    public PublicEmailResponse(String username, String email) {
        this.username = username;
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}