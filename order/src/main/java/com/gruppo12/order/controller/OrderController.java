package com.gruppo12.order.controller;

import com.gruppo12.order.dto.CheckoutRequest;
import com.gruppo12.order.dto.CheckoutResponse;
import com.gruppo12.order.model.Order;
import com.gruppo12.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public Order confirm(@PathVariable String id) {
        return service.confirm(id);
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
            @RequestBody Map<String, Integer> body) {
        try {
            int stars = body.getOrDefault("stars", 0);
            Order updated = service.rateOrder(id, username, stars);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
