package com.gruppo12.card_loader.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CreateListingRequest {

    @NotBlank
    private String cardId;

    @NotBlank
    private String condition;

    @Min(0)
    private double price;

    @Min(1)
    private int quantity;

    public String getCardId() { return cardId; }
    public String getCondition() { return condition; }
    public double getPrice() { return price; }
    public int getQuantity() { return quantity; }
}