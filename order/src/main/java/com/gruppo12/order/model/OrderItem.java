package com.gruppo12.order.model;

public class OrderItem {

    private String cardId;
    private String cardName;
    private double price;
    private String sellerUsername;

    public OrderItem() {}

    public OrderItem(String cardId, String cardName, double price, String sellerUsername) {
        this.cardId = cardId;
        this.cardName = cardName;
        this.price = price;
        this.sellerUsername = sellerUsername;
    }

    public String getCardId() {
        return cardId;
    }

    public void setCardId(String cardId) {
        this.cardId = cardId;
    }

    public String getCardName() {
        return cardName;
    }

    public void setCardName(String cardName) {
        this.cardName = cardName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getSellerUsername() {
        return sellerUsername;
    }

    public void setSellerUsername(String sellerUsername) {
        this.sellerUsername = sellerUsername;
    }
}
