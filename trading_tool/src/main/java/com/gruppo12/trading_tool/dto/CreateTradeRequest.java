package com.gruppo12.trading_tool.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateTradeRequest {

    @NotBlank
    private String targetListingId;

    @NotEmpty
    @Valid
    private List<TradeItemRequest> offeredItems;

    private String proposerMessage;

    public CreateTradeRequest() {
    }

    public String getTargetListingId() {
        return targetListingId;
    }

    public List<TradeItemRequest> getOfferedItems() {
        return offeredItems;
    }

    public String getProposerMessage() {
        return proposerMessage;
    }

    public void setTargetListingId(String targetListingId) {
        this.targetListingId = targetListingId;
    }

    public void setOfferedItems(List<TradeItemRequest> offeredItems) {
        this.offeredItems = offeredItems;
    }

    public void setProposerMessage(String proposerMessage) {
        this.proposerMessage = proposerMessage;
    }
}