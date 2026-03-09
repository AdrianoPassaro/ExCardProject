package com.gruppo12.card_loader.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "listings")
public class ListingDocument {

    @Id
    private String id;

    private String cardId;
    private String sellerId;

    private String condition;
    private double price;
    private int quantity;

    private ListingStatus status;

    private Instant createdAt;

    public ListingDocument() {}

    public ListingDocument(String cardId,
                           String sellerId,
                           String condition,
                           double price,
                           int quantity) {

        this.cardId = cardId;
        this.sellerId = sellerId;
        this.condition = condition;
        this.price = price;
        this.quantity = quantity;
        this.status = ListingStatus.ACTIVE;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getCardId() { return cardId; }
    public String getSellerId() { return sellerId; }
    public String getCondition() { return condition; }
    public double getPrice() { return price; }
    public int getQuantity() { return quantity; }
    public ListingStatus getStatus() { return status; }

    public void setPrice(double price) { this.price = price; }
    public void setStatus(ListingStatus status) { this.status = status; }
}