package com.gruppo12.payment.controller;

import com.gruppo12.payment.dto.PaymentRequest;
import com.gruppo12.payment.dto.RechargeRequest;
import com.gruppo12.payment.model.Wallet;
import com.gruppo12.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    private PaymentService service;

    // ── GET BALANCE ──
    @GetMapping("/balance")
    public double getBalance(@RequestHeader("username") String username) {
        return service.getBalance(username);
    }

    // ── GET POINTS ──
    @GetMapping("/points")
    public int getPoints(@RequestHeader("username") String username) {
        return service.getPoints(username);
    }

    // ── GET FULL WALLET (balance + points) ──
    @GetMapping("/wallet")
    public Wallet getWallet(@RequestHeader("username") String username) {
        return service.getOrCreate(username);
    }

    // ── RECHARGE BALANCE ──
    @PostMapping("/add")
    public Wallet addMoney(@RequestHeader("username") String username,
                           @RequestBody RechargeRequest req) {
        return service.recharge(username, req.getAmount());
    }

    // ── PAY (chiamato da checkout) ──
    // body: { username, amount (totale finale), subtotal (solo articoli, per calcolare punti) }
    @PostMapping("/pay")
    public boolean pay(@RequestBody PaymentRequest req) {
        return service.pay(req.getUsername(), req.getAmount(), req.getSubtotal());
    }

    // ── USE POINTS (chiamato da checkout prima del pay, opzionale) ──
    // restituisce lo sconto in € effettivamente applicato
    @PostMapping("/points/use")
    public double usePoints(@RequestHeader("username") String username,
                            @RequestParam int points) {
        return service.usePoints(username, points);
    }

    // ── ADD POINTS (utility) ──
    @PostMapping("/points/add")
    public Wallet addPoints(@RequestHeader("username") String username,
                            @RequestParam int points) {
        return service.addPoints(username, points);
    }
}
