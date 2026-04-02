package com.gruppo12.order.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import com.gruppo12.order.model.Order;
import com.gruppo12.order.model.OrderItem;
import com.gruppo12.order.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService service;

    @GetMapping
    public List<Order> getOrders(@RequestHeader String username) {
        return service.getOrders(username);
    }

    @PostMapping("/checkout")
    public Object checkout(@RequestHeader String username) {
        return service.checkout(username);
    }

    @PutMapping("/{id}/confirm")
    public Order confirm(@PathVariable String id) {
        return service.confirm(id);
    }
}
