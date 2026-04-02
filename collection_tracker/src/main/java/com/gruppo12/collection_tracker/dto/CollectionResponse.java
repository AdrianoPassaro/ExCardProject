package com.gruppo12.collection_tracker.dto;

import java.util.List;

public class CollectionResponse {

    private List<CardResponse> cards;

    public CollectionResponse(List<CardResponse> cards) {
        this.cards = cards;
    }

    public List<CardResponse> getCards() {
        return cards;
    }
}