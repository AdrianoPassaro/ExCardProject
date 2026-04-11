package com.gruppo12.gestione_utente.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class UserProfile {

    @Id
    private String id;
    private String nome;
    private String cognome;
    private String dataNascita;
    private String indirizzo;
    private String cap;
    private String citta;
    private String provincia;
    private String telefono;
    private String username;
    private String paese;
    private String paeseCode;

    /**
     * Lista dei voti ricevuti come venditore (interi da 1 a 5).
     * Ogni voto viene aggiunto quando un compratore conferma la ricezione dell'ordine.
     */
    private List<Integer> ratings = new ArrayList<>();

    public UserProfile() {}

    public UserProfile(String username) { this.username = username; }

    public String getId()                          { return id; }

    public String getUsername()                    { return username; }
    public void   setUsername(String username)     { this.username = username; }

    public String getNome()                        { return nome; }
    public void   setNome(String nome)             { this.nome = nome; }

    public String getCognome()                     { return cognome; }
    public void   setCognome(String cognome)       { this.cognome = cognome; }

    public String getDataNascita()                 { return dataNascita; }
    public void   setDataNascita(String v)         { this.dataNascita = v; }

    public String getIndirizzo()                   { return indirizzo; }
    public void   setIndirizzo(String indirizzo)   { this.indirizzo = indirizzo; }

    public String getCap()                         { return cap; }
    public void   setCap(String cap)               { this.cap = cap; }

    public String getCitta()                       { return citta; }
    public void   setCitta(String citta)           { this.citta = citta; }

    public String getProvincia()                   { return provincia; }
    public void   setProvincia(String provincia)   { this.provincia = provincia; }

    public String getTelefono()                    { return telefono; }
    public void   setTelefono(String telefono)     { this.telefono = telefono; }

    public String getPaese()                       { return paese; }
    public void setPaese(String paese)             { this.paese = paese; }

    public String getPaeseCode()                   { return paeseCode; }
    public void setPaeseCode(String paeseCode)     { this.paeseCode = paeseCode; }

    public List<Integer> getRatings()              { return ratings; }
    public void setRatings(List<Integer> ratings)  { this.ratings = ratings != null ? ratings : new ArrayList<>(); }

    // Utility: aggiungi un singolo voto
    public void addRating(int stars) {
        if (stars < 1) stars = 1;
        if (stars > 5) stars = 5;
        if (this.ratings == null) this.ratings = new ArrayList<>();
        this.ratings.add(stars);
    }

    // Utility: media voti (0.0 se nessun voto)
    public double getAverageRating() {
        if (ratings == null || ratings.isEmpty()) return 0.0;
        return ratings.stream().mapToInt(Integer::intValue).average().orElse(0.0);
    }

    public int getRatingCount() {
        return ratings == null ? 0 : ratings.size();
    }
}


