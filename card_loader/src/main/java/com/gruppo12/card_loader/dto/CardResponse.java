package com.gruppo12.card_loader.dto;

import com.gruppo12.card_loader.model.CardDocument;

public class CardResponse {

    private String id;
    private String name;
    private String setName;

    public CardResponse(CardDocument card) {
        this.id = card.getId();
        this.name = card.getName();
        this.setName = card.getSetName();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getSetName() { return setName; }
}