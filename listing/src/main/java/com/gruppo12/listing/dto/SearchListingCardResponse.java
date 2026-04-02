package com.gruppo12.listing.dto;

public class SearchListingCardResponse {

    private String cardId;
    private String name;
    private String setName;
    private String number;
    private String imageUrl;
    private Double averagePrice;

    public SearchListingCardResponse(String cardId,
                                     String name,
                                     String setName,
                                     String number,
                                     String imageUrl,
                                     Double averagePrice) {
        this.cardId = cardId;
        this.name = name;
        this.setName = setName;
        this.number = number;
        this.imageUrl = imageUrl;
        this.averagePrice = averagePrice;
    }

    public String getCardId() {
        return cardId;
    }

    public String getName() {
        return name;
    }

    public String getSetName() {
        return setName;
    }

    public String getNumber() {
        return number;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Double getAveragePrice() {
        return averagePrice;
    }
}