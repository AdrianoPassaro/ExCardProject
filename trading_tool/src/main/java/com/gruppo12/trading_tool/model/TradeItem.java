package com.gruppo12.trading_tool.model;

public class TradeItem {

    private String cardId;
    private String condition;
    private int quantity;

    public TradeItem() {
    }

    public TradeItem(String cardId, String condition, int quantity) {
        this.cardId = cardId;
        this.condition = condition;
        this.quantity = quantity;
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
