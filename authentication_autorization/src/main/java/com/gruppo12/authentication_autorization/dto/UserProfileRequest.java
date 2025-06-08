package com.gruppo12.authentication_autorization.dto;

public class UserProfileRequest {
    private String telefono;
    private String citta;
    private String cap;
    private String nome;
    private String cognome;
    private String dataNascita;
    private String indirizzo;
    private String password;
    private String provincia;

    public String getTelefono() { return telefono; }
    public String getCitta() { return citta; }
    public String getCap() { return cap; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public void setCitta(String citta) { this.citta = citta; }
    public void setCap(String cap) { this.cap = cap; }
    public String getNome() { return nome; }
    public String getCognome() { return cognome; }
    public String getDataNascita() { return dataNascita; }
    public String getIndirizzo() { return indirizzo; }
    public String getPassword() { return password; }
    public String getProvincia() { return provincia; }
    public void setNome(String nome) { this.nome = nome; }
    public void setCognome(String cognome) { this.cognome = cognome; }
    public void setDataNascita(String dataNascita) { this.dataNascita = dataNascita; }
    public void setIndirizzo(String indirizzo) { this.indirizzo = indirizzo; }
    public void setPassword(String password) { this.password = password; }
    public void setProvincia(String provincia) { this.provincia = provincia; }

}

