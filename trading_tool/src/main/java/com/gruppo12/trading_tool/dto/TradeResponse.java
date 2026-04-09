package com.gruppo12.trading_tool.dto;

import com.gruppo12.trading_tool.model.TradeItem;
import com.gruppo12.trading_tool.model.TradeOfferDocument;
import com.gruppo12.trading_tool.model.TradeStatus;

import java.time.Instant;
import java.util.List;

public class TradeResponse {

    private String id;
    private String proposerUsername;
    private String recipientUsername;
    private String targetListingId;
    private String targetCardId;
    private String targetCondition;
    private double targetListingPrice;
    private int targetQuantity;
    private List<TradeItem> offeredItems;
    private String proposerMessage;
    private String recipientMessage;
    private TradeStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public TradeResponse() {
    }

    public TradeResponse(TradeOfferDocument trade) {
        this.id = trade.getId();
        this.proposerUsername = trade.getProposerUsername();
        this.recipientUsername = trade.getRecipientUsername();
        this.targetListingId = trade.getTargetListingId();
        this.targetCardId = trade.getTargetCardId();
        this.targetCondition = trade.getTargetCondition();
        this.targetListingPrice = trade.getTargetListingPrice();
        this.targetQuantity = trade.getTargetQuantity();
        this.offeredItems = trade.getOfferedItems();
        this.proposerMessage = trade.getProposerMessage();
        this.recipientMessage = trade.getRecipientMessage();
        this.status = trade.getStatus();
        this.createdAt = trade.getCreatedAt();
        this.updatedAt = trade.getUpdatedAt();
    }

    public String getId() {
        return id;
    }

    public String getProposerUsername() {
        return proposerUsername;
    }

    public String getRecipientUsername() {
        return recipientUsername;
    }

    public String getTargetListingId() {
        return targetListingId;
    }

    public String getTargetCardId() {
        return targetCardId;
    }

    public String getTargetCondition() {
        return targetCondition;
    }

    public double getTargetListingPrice() {
        return targetListingPrice;
    }

    public int getTargetQuantity() {
        return targetQuantity;
    }

    public List<TradeItem> getOfferedItems() {
        return offeredItems;
    }

    public String getProposerMessage() {
        return proposerMessage;
    }

    public String getRecipientMessage() {
        return recipientMessage;
    }

    public TradeStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
