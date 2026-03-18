package com.gruppo12.listing.dto;

import com.gruppo12.listing.model.ListingDocument;
import com.gruppo12.listing.model.ListingStatus;

import java.time.Instant;

public class ListingResponse {

    private String id;
    private String cardId;
    private String sellerId;

    private double price;
    private String condition;
    private int quantity;

    private ListingStatus status;
    private Instant createdAt;

    public ListingResponse(ListingDocument listing) {
        this.id = listing.getId();
        this.cardId = listing.getCardId();
        this.sellerId = listing.getSellerId();
        this.price = listing.getPrice();
        this.condition = listing.getCondition();
        this.quantity = listing.getQuantity();
        this.status = listing.getStatus();
        this.createdAt = listing.getCreatedAt();
    }

    public String getId() { return id; }

    public String getCardId() { return cardId; }

    public String getSellerId() { return sellerId; }

    public double getPrice() { return price; }

    public String getCondition() { return condition; }

    public int getQuantity() { return quantity; }

    public ListingStatus getStatus() { return status; }

    public Instant getCreatedAt() { return createdAt; }

}