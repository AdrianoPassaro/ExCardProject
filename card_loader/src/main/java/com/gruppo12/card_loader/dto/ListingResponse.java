package com.gruppo12.card_loader.dto;

import com.gruppo12.card_loader.model.ListingDocument;

public class ListingResponse {

    private String id;
    private String cardId;
    private double price;
    private int quantity;
    private String condition;

    public ListingResponse(ListingDocument listing) {
        this.id = listing.getId();
        this.cardId = listing.getCardId();
        this.price = listing.getPrice();
        this.quantity = listing.getQuantity();
        this.condition = listing.getCondition();
    }

    public String getId() { return id; }
    public String getCardId() { return cardId; }
    public double getPrice() { return price; }
    public int getQuantity() { return quantity; }
    public String getCondition() { return condition; }
}