package com.gruppo12.payment.service;

import com.gruppo12.payment.model.Wallet;
import com.gruppo12.payment.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private WalletRepository walletRepository;

    public Wallet getOrCreate(String username) {
        return walletRepository.findByUsername(username)
                .orElseGet(() -> {
                    Wallet w = new Wallet();
                    w.setUsername(username);
                    w.setBalance(0);
                    return walletRepository.save(w);
                });
    }

    public Wallet recharge(String username, double amount) {
        Wallet w = getOrCreate(username);
        w.setBalance(w.getBalance() + amount);
        return walletRepository.save(w);
    }

    public boolean pay(String username, double amount) {
        Wallet w = getOrCreate(username);

        if (w.getBalance() < amount) return false;

        w.setBalance(w.getBalance() - amount);
        walletRepository.save(w);
        return true;
    }
}