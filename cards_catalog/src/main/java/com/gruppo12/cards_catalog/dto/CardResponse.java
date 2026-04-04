package com.gruppo12.cards_catalog.dto;

import com.gruppo12.cards_catalog.model.CardDocument;
public class CardResponse {

    private String id;
    private String name;
    private String setName;
    private String number;
    private String rarity;
    private String imageUrl;

    public CardResponse() {}

    public CardResponse(CardDocument card) {
        this.id = card.getId();
        this.name = card.getName();
        this.setName = card.getSetName();
        this.number = card.getNumber();
        this.rarity = card.getRarity();
        this.imageUrl = card.getImageUrl();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSetName() { return setName; }
    public void setSetName(String setName) { this.setName = setName; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public String getRarity() { return rarity; }
    public void setRarity(String rarity) { this.rarity = rarity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}