package com.gruppo12.listing.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "listings")
public class ListingDocument {

    @Id
    private String id;

    private String cardId;
    private String sellerUsername;

    private double price;
    private String condition;
    private int quantity;

    private ListingStatus status;

    private Instant createdAt;

    public ListingDocument(String cardId,
                           String sellerUsername,
                           String condition,
                           double price,
                           int quantity) {

        this.cardId = cardId;
        this.sellerUsername = sellerUsername;
        this.condition = condition;
        this.price = price;
        this.quantity = quantity;
        this.status = ListingStatus.ACTIVE;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }

    public String getCardId() { return cardId; }

    public String getSellerUsername() { return sellerUsername; }

    public double getPrice() { return price; }

    public String getCondition() { return condition; }

    public int getQuantity() { return quantity; }

    public ListingStatus getStatus() { return status; }

    public Instant getCreatedAt() { return createdAt; }

}
