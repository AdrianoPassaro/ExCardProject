package com.gruppo12.trading_tool.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "trades")
public class TradeOfferDocument {

    @Id
    private String id;

    private String proposerUsername;
    private String recipientUsername;

    private String targetListingId;
    private String targetCardId;
    private String targetCondition;
    private double targetListingPrice;
    private int targetQuantity;

    private List<TradeItem> offeredItems = new ArrayList<>();

    private String proposerMessage;
    private String recipientMessage;

    private TradeStatus status = TradeStatus.PENDING;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public TradeOfferDocument() {
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

    public void setId(String id) {
        this.id = id;
    }

    public void setProposerUsername(String proposerUsername) {
        this.proposerUsername = proposerUsername;
    }

    public void setRecipientUsername(String recipientUsername) {
        this.recipientUsername = recipientUsername;
    }

    public void setTargetListingId(String targetListingId) {
        this.targetListingId = targetListingId;
    }

    public void setTargetCardId(String targetCardId) {
        this.targetCardId = targetCardId;
    }

    public void setTargetCondition(String targetCondition) {
        this.targetCondition = targetCondition;
    }

    public void setTargetListingPrice(double targetListingPrice) {
        this.targetListingPrice = targetListingPrice;
    }

    public void setTargetQuantity(int targetQuantity) {
        this.targetQuantity = targetQuantity;
    }

    public void setOfferedItems(List<TradeItem> offeredItems) {
        this.offeredItems = offeredItems;
    }

    public void setProposerMessage(String proposerMessage) {
        this.proposerMessage = proposerMessage;
    }

    public void setRecipientMessage(String recipientMessage) {
        this.recipientMessage = recipientMessage;
    }

    public void setStatus(TradeStatus status) {
        this.status = status;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}