package com.gruppo12.listing.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CreateListingRequest {

    @NotBlank
    private String cardId;

    @Min(0)
    private double price;

    @NotBlank
    private String condition;

    @Min(1)
    private int quantity;

    public String getCardId() { return cardId; }

    public double getPrice() { return price; }

    public String getCondition() { return condition; }

    public int getQuantity() { return quantity; }

}