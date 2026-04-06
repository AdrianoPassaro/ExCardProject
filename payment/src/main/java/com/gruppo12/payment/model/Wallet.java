package com.gruppo12.payment.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "wallets")
public class Wallet {

    @Id
    private String id;

    private String username;
    private double balance;
    private int points;   // punti fedeltà: 1 punto = €0.01, si guadagnano 3pt/€

    public Wallet() {}

    public Wallet(String username, double balance) {
        this.username = username;
        this.balance  = balance;
        this.points   = 0;
    }

    public String getId()                  { return id; }

    public String getUsername()            { return username; }
    public void   setUsername(String u)    { this.username = u; }

    public double getBalance()             { return balance; }
    public void   setBalance(double b)     { this.balance = b; }

    public int  getPoints()                { return points; }
    public void setPoints(int p)           { this.points = p; }
}
