package com.gruppo12.cart.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.gruppo12.cart.model.Cart;

public interface CartRepository extends MongoRepository<Cart, String> {
}
