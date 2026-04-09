package com.gruppo12.gestione_utente.dto;

public class SellerProfileResponse {
    private String username;
    private String nome;
    private String cognome;
    private Double averageRating;
    private Integer totalSales;

    public SellerProfileResponse() {
    }

    public SellerProfileResponse(String username, String nome, String cognome, Double averageRating, Integer totalSales) {
        this.username = username;
        this.nome = nome;
        this.cognome = cognome;
        this.averageRating = averageRating;
        this.totalSales = totalSales;
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
}