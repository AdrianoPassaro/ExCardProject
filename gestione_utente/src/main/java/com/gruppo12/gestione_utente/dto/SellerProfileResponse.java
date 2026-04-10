package com.gruppo12.gestione_utente.dto;

public class SellerProfileResponse {

    private String username;
    private String nome;
    private String cognome;
    private Double averageRating;   // media voti (0.0–5.0)
    private Integer ratingCount;    // numero di recensioni ricevute
    private Integer totalSales;     // placeholder

    public SellerProfileResponse() {}

    public SellerProfileResponse(String username, String nome, String cognome,
                                 Double averageRating, Integer ratingCount, Integer totalSales) {
        this.username     = username;
        this.nome         = nome;
        this.cognome      = cognome;
        this.averageRating = averageRating;
        this.ratingCount  = ratingCount;
        this.totalSales   = totalSales;
    }

    public String  getUsername()                           { return username; }
    public void    setUsername(String username)            { this.username = username; }

    public String  getNome()                               { return nome; }
    public void    setNome(String nome)                    { this.nome = nome; }

    public String  getCognome()                            { return cognome; }
    public void    setCognome(String cognome)              { this.cognome = cognome; }

    public Double  getAverageRating()                      { return averageRating; }
    public void    setAverageRating(Double averageRating)  { this.averageRating = averageRating; }

    public Integer getRatingCount()                        { return ratingCount; }
    public void    setRatingCount(Integer ratingCount)     { this.ratingCount = ratingCount; }

    public Integer getTotalSales()                         { return totalSales; }
    public void    setTotalSales(Integer totalSales)       { this.totalSales = totalSales; }
}