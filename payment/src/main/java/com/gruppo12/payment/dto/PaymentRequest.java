package com.gruppo12.payment.dto;

public class PaymentRequest {
    private String username;
    private double amount;

    public PaymentRequest() {}

    public PaymentRequest(String username, double amount) {
        this.username = username;
        this.amount = amount;
    }

    public String getUsername() { return username; }
    public double getAmount() { return amount; }
}
