package com.gruppo12.order.controller;

import com.gruppo12.order.dto.CheckoutRequest;
import com.gruppo12.order.dto.CheckoutResponse;
import com.gruppo12.order.model.Order;
import com.gruppo12.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService service;

    @GetMapping("/purchases")
    public List<Order> getPurchases(@RequestHeader String username) {
        return service.getBuyerOrders(username);
    }

    @GetMapping("/sales")
    public List<Order> getSales(@RequestHeader String username) {
        return service.getSellerOrders(username);
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@RequestBody CheckoutRequest req) {
        return service.createOrders(req);
    }

    @PutMapping("/{id}/confirm")
    public Order confirm(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) { // Aggiunto il token
        return service.confirm(id, token); // Passa il token al service
    }

    /**
     * Salva la recensione nell'ordine ed aggiorna il profilo venditore.
     * Body: { "stars": 4 }
     * Se buyerRating è già > 0 viene sovrascritto (modifica recensione).
     * Restituisce l'ordine aggiornato con il nuovo buyerRating.
     */
    @PutMapping("/{id}/rate")
    public ResponseEntity<Order> rate(
            @PathVariable String id,
            @RequestHeader String username,
            @RequestHeader("Authorization") String token, // Prende il Bearer token dal browser
            @RequestBody Map<String, Integer> body) {
        try {
            int stars = body.getOrDefault("stars", 0);
            // Passa il token al service
            Order updated = service.rateOrder(id, username, stars, token);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}
