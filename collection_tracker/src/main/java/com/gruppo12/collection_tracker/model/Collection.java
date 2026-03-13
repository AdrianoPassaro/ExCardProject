package com.gruppo12.collection_tracker.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "collections")
public class Collection {

    @Id
    private String id;
    private String username; // riferimento all'utente proprietario della collezione
    private List<Card> cards = new ArrayList<>();

    public Collection() {}

    public Collection(String id) {
        this.id = id;
    }

    // getter e setter
    public String getId() { return id; }
    public void setId(String userId) { this.id = userId; }

    public List<Card> getCards() { return cards; }
    public void setCards(List<Card> cards) { this.cards = cards; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}