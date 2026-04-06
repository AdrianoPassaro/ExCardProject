package com.gruppo12.payment.dto;

public class PaymentRequest {

    private String username;
    private double amount;    // totale finale (articoli + spedizioni - sconto punti)
    private double subtotal;  // solo articoli, usato per calcolare punti guadagnati

    public PaymentRequest() {}

    public PaymentRequest(String username, double amount, double subtotal) {
        this.username = username;
        this.amount   = amount;
        this.subtotal = subtotal;
    }

    public String getUsername()          { return username; }
    public void   setUsername(String u)  { this.username = u; }

    public double getAmount()            { return amount; }
    public void   setAmount(double a)    { this.amount = a; }

    public double getSubtotal()          { return subtotal; }
    public void   setSubtotal(double s)  { this.subtotal = s; }
}
