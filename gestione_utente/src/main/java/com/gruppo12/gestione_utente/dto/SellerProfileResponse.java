package com.gruppo12.gestione_utente.dto;

public class SellerProfileResponse {
    private String username;
    private String nome;
    private String cognome;
    private Double averageRating;
    private Integer totalSales;
    private String email;
    private String paese;
    private String paeseCode;

    public SellerProfileResponse() {
    }

    public SellerProfileResponse(String username, String nome, String cognome, Double averageRating, Integer totalSales, String email, String paese, String paeseCode) {
        this.username = username;
        this.nome = nome;
        this.cognome = cognome;
        this.averageRating = averageRating;
        this.totalSales = totalSales;
        this.email = email;
        this.paese = paese;
        this.paeseCode = paeseCode;
    }

    public String getUsername() {
        return username;
    }

    public String getNome() {
        return nome;
    }

    public String getCognome() {
        return cognome;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Integer getTotalSales() {
        return totalSales;
    }

    public String getEmail() {
        return email;
    }

    public String getPaese() {
        return paese;
    }

    public String getPaeseCode() {
        return paeseCode;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public void setTotalSales(Integer totalSales) {
        this.totalSales = totalSales;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPaese(String paese) {
        this.paese = paese;
    }

    public void setPaeseCode(String paeseCode) {
        this.paeseCode = paeseCode;
    }
}