package com.gruppo12.trading_tool.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TradeItemRequest {

    @NotBlank
    private String cardId;

    @NotBlank
    private String condition;

    @NotNull
    @Min(1)
    private Integer quantity;

    public TradeItemRequest() {
    }

    public String getCardId() {
        return cardId;
    }

    public String getCondition() {
        return condition;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setCardId(String cardId) {
        this.cardId = cardId;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}