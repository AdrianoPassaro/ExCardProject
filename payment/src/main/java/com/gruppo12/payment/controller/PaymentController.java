package com.gruppo12.payment.controller;

import com.gruppo12.payment.dto.PaymentRequest;
import com.gruppo12.payment.dto.RechargeRequest;
import com.gruppo12.payment.model.Wallet;
import com.gruppo12.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService service;

    // ✅ GET BALANCE
    @GetMapping("/balance")
    public double getBalance(@RequestHeader("username") String username) {
        return service.getOrCreate(username).getBalance();
    }

    // ✅ ADD MONEY
    @PostMapping("/add")
    public Wallet addMoney(@RequestHeader("username") String username,
                           @RequestBody RechargeRequest req) {
        return service.recharge(username, req.getAmount());
    }

    // ✅ PAY (usato da order service)
    @PostMapping("/pay")
    public boolean pay(@RequestBody PaymentRequest req) {
        return service.pay(req.getUsername(), req.getAmount());
    }
}
