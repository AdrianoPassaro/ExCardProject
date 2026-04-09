package com.gruppo12.collection_tracker.dto;

public class TradeCollectionItemRequest {

    private String cardId;
    private String condition;
    private int quantity;

    public TradeCollectionItemRequest() {
    }

    public String getCardId() {
        return cardId;
    }

    public String getCondition() {
        return condition;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setCardId(String cardId) {
        this.cardId = cardId;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}