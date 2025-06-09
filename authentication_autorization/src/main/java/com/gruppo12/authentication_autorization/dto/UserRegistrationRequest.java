package com.gruppo12.authentication_autorization.dto;

public class UserRegistrationRequest {
    public String nome;
    public String cognome;
    public String dataNascita;
    public String indirizzo;
    private String email;
    private String telefono;
    private String citta;
    private String cap; // codice postale
    private String provincia;
    private String username;
    private String password;

    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getEmail() { return email; }
    public String getTelefono() { return telefono; }
    public String getCitta() { return citta; }
    public String getCap() { return cap; }
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setEmail(String email) { this.email = email; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public void setCitta(String citta) { this.citta = citta; }
    public void setCap(String cap) { this.cap = cap; }
    public String getNome() { return nome; }
    public String getCognome() { return cognome; }
    public String getDataNascita() { return dataNascita; }
    public String getIndirizzo() { return indirizzo; }
    public String getProvincia() { return provincia; }
    public void setNome(String nome) { this.nome = nome; }
    public void setCognome(String cognome) { this.cognome = cognome; }
    public void setDataNascita(String dataNascita) { this.dataNascita = dataNascita; }
    public void setIndirizzo(String indirizzo) { this.indirizzo = indirizzo; }

}

