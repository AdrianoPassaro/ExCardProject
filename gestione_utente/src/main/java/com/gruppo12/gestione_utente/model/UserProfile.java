package com.gruppo12.gestione_utente.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.HashMap;
import java.util.Map;

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

    // Mappa: Key = orderId, Value = stars
    private Map<String, Integer> ratings = new HashMap<>();
    private int totalSales = 0;

    public UserProfile() {}

    public UserProfile(String username) { this.username = username; }

    // Getter e Setter standard
    public String getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCognome() { return cognome; }
    public void setCognome(String cognome) { this.cognome = cognome; }
    public String getDataNascita() { return dataNascita; }
    public void setDataNascita(String dataNascita) { this.dataNascita = dataNascita; }
    public String getIndirizzo() { return indirizzo; }
    public void setIndirizzo(String indirizzo) { this.indirizzo = indirizzo; }
    public String getCap() { return cap; }
    public void setCap(String cap) { this.cap = cap; }
    public String getCitta() { return citta; }
    public void setCitta(String citta) { this.citta = citta; }
    public String getProvincia() { return provincia; }
    public void setProvincia(String provincia) { this.provincia = provincia; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public Map<String, Integer> getRatings() { return ratings; }
    public void setRatings(Map<String, Integer> ratings) { this.ratings = ratings; }

    public int getTotalSales() { return totalSales; }
    public void setTotalSales(int totalSales) { this.totalSales = totalSales; }
    public String getPaese()                       { return paese; }
    public void setPaese(String paese)             { this.paese = paese; }

    public String getPaeseCode()                   { return paeseCode; }
    public void setPaeseCode(String paeseCode)     { this.paeseCode = paeseCode; }

    public void incrementSales() {
        this.totalSales++;
    }

    // LOGICA DI AGGIORNAMENTO/MODIFICA
    public void addOrUpdateRating(String orderId, int stars) {
        if (stars < 1) stars = 1;
        if (stars > 5) stars = 5;
        if (this.ratings == null) this.ratings = new HashMap<>();
        this.ratings.put(orderId, stars); // Se l'orderId esiste già, sovrascrive il voto precedente
    }

    public double getAverageRating() {
        if (ratings == null || ratings.isEmpty()) return 0.0;
        return ratings.values().stream().mapToInt(Integer::intValue).average().orElse(0.0);
    }

    public int getRatingCount() {
        return ratings == null ? 0 : ratings.size();
    }
}


