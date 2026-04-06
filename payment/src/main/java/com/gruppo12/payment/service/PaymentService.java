package com.gruppo12.payment.service;

import com.gruppo12.payment.model.Wallet;
import com.gruppo12.payment.repository.WalletRepository;
import com.gruppo12.payment.dto.RechargeRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private WalletRepository repo;

    private static final int    POINTS_PER_EURO   = 3;    // 3pt per ogni € speso
    private static final double POINTS_TO_EURO    = 0.01; // 1pt = €0.01

    // ── GET OR CREATE ──
    public Wallet getOrCreate(String username) {
        return repo.findByUsername(username)
                .orElseGet(() -> repo.save(new Wallet(username, 0.0)));
    }

    // ── GET BALANCE ──
    public double getBalance(String username) {
        return getOrCreate(username).getBalance();
    }

    // ── GET POINTS ──
    public int getPoints(String username) {
        return getOrCreate(username).getPoints();
    }

    // ── RECHARGE ──
    public Wallet recharge(String username, double amount) {
        Wallet w = getOrCreate(username);
        w.setBalance(w.getBalance() + amount);
        return repo.save(w);
    }

    // ── PAY: scala balance e accredita punti sul subtotale articoli ──
    public boolean pay(String username, double totalAmount, double subtotal) {
        Wallet w = getOrCreate(username);
        if (w.getBalance() < totalAmount) return false;

        w.setBalance(w.getBalance() - totalAmount);

        // punti guadagnati sul subtotale articoli (non sulla spedizione)
        int earned = (int) Math.floor(subtotal * POINTS_PER_EURO);
        w.setPoints(w.getPoints() + earned);

        repo.save(w);
        return true;
    }

    // ── USE POINTS: scala punti e restituisce lo sconto in € applicato ──
    public double usePoints(String username, int pointsToUse) {
        Wallet w = getOrCreate(username);
        int available = w.getPoints();
        int actual    = Math.min(pointsToUse, available);  // non puoi usare più di quelli che hai

        double discount = actual * POINTS_TO_EURO;
        w.setPoints(available - actual);
        repo.save(w);
        return discount;
    }

    // ── ADD POINTS (utility, es. per correzioni manuali) ──
    public Wallet addPoints(String username, int points) {
        Wallet w = getOrCreate(username);
        w.setPoints(w.getPoints() + points);
        return repo.save(w);
    }
}