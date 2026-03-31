package com.gruppo12.order.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String buyerUsername;
    private String sellerUsername;

    private List<OrderItem> items;

    private double totalPrice;
    private double shippingCost;
    private double finalPrice;

    private OrderStatus status;

    public Order() {}

    public Order(String buyerUsername, String sellerUsername, List<OrderItem> items, double totalPrice, double shippingCost, double finalPrice, OrderStatus status) {
        this.buyerUsername = buyerUsername;
        this.sellerUsername = sellerUsername;
        this.items = items;
        this.totalPrice = totalPrice;
        this.shippingCost = shippingCost;
        this.finalPrice = finalPrice;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getBuyerUsername() {
        return buyerUsername;
    }

    public void setBuyerUsername(String buyerUsername) {
        this.buyerUsername = buyerUsername;
    }

    public String getSellerUsername() {
        return sellerUsername;
    }

    public void setSellerUsername(String sellerUsername) {
        this.sellerUsername = sellerUsername;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public double getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(double shippingCost) {
        this.shippingCost = shippingCost;
    }

    public double getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(double finalPrice) {
        this.finalPrice = finalPrice;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
