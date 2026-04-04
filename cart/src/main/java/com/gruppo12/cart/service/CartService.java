package com.gruppo12.cart.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;

import com.gruppo12.cart.model.*;
import com.gruppo12.cart.repository.CartRepository;
import com.gruppo12.cart.dto.AddToCartRequest;

@Service
public class CartService {

    @Autowired
    private CartRepository repo;

    public Cart getCart(String username) {
        return repo.findById(username)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUsername(username);
                    c.setItems(new ArrayList<>());
                    return repo.save(c);
                });
    }

    public Cart addToCart(String username, AddToCartRequest req) {

        Cart cart = getCart(username);

        // Evita duplicati sullo stesso listingId
        boolean exists = cart.getItems().stream()
                .anyMatch(i -> i.getListingId().equals(req.getListingId()));

        if (!exists) {
            CartItem item = new CartItem();
            item.setListingId(req.getListingId());
            item.setCardId(req.getCardId());
            item.setSellerId(req.getSellerId());
            item.setCondition(req.getCondition());
            item.setPrice(req.getPrice());
            item.setQuantity(req.getQuantity());

            cart.getItems().add(item);
        }

        return repo.save(cart);
    }

    public Cart removeItem(String username, String listingId) {

        Cart cart = getCart(username);

        cart.setItems(
                cart.getItems().stream()
                        .filter(i -> !i.getListingId().equals(listingId))
                        .toList()
        );

        return repo.save(cart);
    }

    public void clearCart(String username) {
        Cart cart = getCart(username);
        cart.setItems(new ArrayList<>());
        repo.save(cart);
    }
}