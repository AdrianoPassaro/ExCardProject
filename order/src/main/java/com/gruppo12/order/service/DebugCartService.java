package com.gruppo12.order.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

import com.gruppo12.order.model.OrderItem;

@Service
public class DebugCartService {

    public List<OrderItem> getCart() {

        List<OrderItem> list = new ArrayList<>();

        list.add(new OrderItem("card1", "luis", 50, "Charizard"));
        list.add(new OrderItem("card2", "marco", 20, "Pikachu"));
        list.add(new OrderItem("card3", "luis", 70, "Blastoise"));

        return list;
    }
}
