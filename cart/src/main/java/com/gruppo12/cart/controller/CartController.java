package com.gruppo12.cart.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import com.gruppo12.cart.model.Cart;
import com.gruppo12.cart.service.CartService;
import com.gruppo12.cart.dto.AddToCartRequest;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin("*")
public class CartController {

    @Autowired
    private CartService service;

    @GetMapping
    public Cart getCart(@RequestHeader String username) {
        return service.getCart(username);
    }

    @PostMapping("/add")
    public Cart addToCart(
            @RequestHeader String username,
            @RequestBody AddToCartRequest req
    ) {
        return service.addToCart(username, req);
    }

    @DeleteMapping("/{listingId}")
    public Cart remove(
            @RequestHeader String username,
            @PathVariable String listingId
    ) {
        return service.removeItem(username, listingId);
    }

    @DeleteMapping("/clear")
    public void clear(@RequestHeader String username) {
        service.clearCart(username);
    }
}
