package com.gruppo12.trading_tool.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CounterTradeRequest {

    @NotEmpty
    @Valid
    private List<TradeItemRequest> offeredItems;

    private String recipientMessage;

    public CounterTradeRequest() {
    }

    public List<TradeItemRequest> getOfferedItems() {
        return offeredItems;
    }

    public String getRecipientMessage() {
        return recipientMessage;
    }

    public void setOfferedItems(List<TradeItemRequest> offeredItems) {
        this.offeredItems = offeredItems;
    }

    public void setRecipientMessage(String recipientMessage) {
        this.recipientMessage = recipientMessage;
    }
}
