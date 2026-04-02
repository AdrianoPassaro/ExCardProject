package com.gruppo12.order.dto;

import java.util.List;

public class CartResponse {

    private String username;
    private List<CartItemDTO> items;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public List<CartItemDTO> getItems() { return items; }
    public void setItems(List<CartItemDTO> items) { this.items = items; }
}
