package com.gruppo12.order.controller;

import com.gruppo12.order.dto.CheckoutRequest;
import com.gruppo12.order.dto.CheckoutResponse;
import com.gruppo12.order.model.Order;
import com.gruppo12.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService service;

    // GET acquisti dell'utente loggato
    @GetMapping("/purchases")
    public List<Order> getPurchases(@RequestHeader String username) {
        return service.getBuyerOrders(username);
    }

    // GET vendite dell'utente loggato
    @GetMapping("/sales")
    public List<Order> getSales(@RequestHeader String username) {
        return service.getSellerOrders(username);
    }

    // POST crea ordini dopo il pagamento (chiamato da checkout.js)
    @PostMapping("/checkout")
    public CheckoutResponse checkout(@RequestBody CheckoutRequest req) {
        return service.createOrders(req);
    }

    // PUT conferma ricezione → passa a COMPLETATO e accredita il venditore
    @PutMapping("/{id}/confirm")
    public Order confirm(@PathVariable String id) {
        return service.confirm(id);
    }
}
