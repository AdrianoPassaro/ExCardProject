package com.gruppo12.collection_tracker.model;

public class Card {

    private String cardId;
    private String condition;
    private int quantity;

    public Card() {}

    public Card(String cardId, String condition, int quantity) {
        this.cardId = cardId;
        this.condition = condition;
        this.quantity = quantity;
    }

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}