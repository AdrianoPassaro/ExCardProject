package com.gruppo12.order.repository;

import com.gruppo12.order.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByBuyerUsernameOrderByCreatedAtDesc(String buyerUsername);
    List<Order> findBySellerUsernameOrderByCreatedAtDesc(String sellerUsername);
}
