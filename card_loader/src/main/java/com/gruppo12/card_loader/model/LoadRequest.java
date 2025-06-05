package com.gruppo12.card_loader.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Document(collection = "load_requests")
public class LoadRequest {
    @Id
    private String id;

    @NotBlank
    private String userId;

    @NotBlank
    private String cardName;

    @Min(0)
    private double price;

    private boolean approved;

    @NotBlank
    private String cardSet;

    @NotBlank
    private String setNumber;

    @NotNull(message = "Card condition is required")
    private CardCondition condition;

    // Enum per la condizione della carta
    public enum CardCondition {
        POOR, PLAYED, LIGHT_PLAYED, GOOD, EXCELLENT, NEAR_MINT, MINT
    }

    // Costruttore vuoto
    public LoadRequest() {
    }

    // Costruttore completo
    public LoadRequest(String userId, String cardName, double price, String cardSet, String setNumber, CardCondition condition) {
        this.userId = userId;
        this.cardName = cardName;
        this.price = price;
        this.cardSet = cardSet;
        this.setNumber = setNumber;
        this.condition = condition;
        this.approved = false;
    }

    // Getters e Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCardName() {
        return cardName;
    }

    public void setCardName(String cardName) {
        this.cardName = cardName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public String getCardSet() {
        return cardSet;
    }

    public void setCardSet(String cardSet) {
        this.cardSet = cardSet;
    }

    public String getSetNumber() {
        return setNumber;
    }

    public void setSetNumber(String setNumber) {
        this.setNumber = setNumber;
    }

    public CardCondition getCondition() {
        return condition;
    }

    public void setCondition(CardCondition condition) {
        this.condition = condition;
    }

    @Override
    public String toString() {
        return "LoadRequest{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", cardName='" + cardName + '\'' +
                ", price=" + price +
                ", approved=" + approved +
                ", cardSet='" + cardSet + '\'' +
                ", setNumber='" + setNumber + '\'' +
                ", condition=" + condition +
                '}';
    }
}