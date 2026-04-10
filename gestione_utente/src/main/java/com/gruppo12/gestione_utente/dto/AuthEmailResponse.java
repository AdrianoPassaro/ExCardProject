package com.gruppo12.gestione_utente.dto;

public class AuthEmailResponse {

    private String username;
    private String email;

    public AuthEmailResponse() {
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
