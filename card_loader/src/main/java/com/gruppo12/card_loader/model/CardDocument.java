package com.gruppo12.card_loader.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cards")
public class CardDocument {

    @Id
    private String id;

    private String name;
    private String setName;
    private String number;
    private String rarity;
    private String imageUrl;

    public CardDocument() {}

    public CardDocument(String name, String setName, String number, String rarity, String imageUrl) {
        this.name = name;
        this.setName = setName;
        this.number = number;
        this.rarity = rarity;
        this.imageUrl = imageUrl;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getSetName() { return setName; }
    public String getNumber() { return number; }
    public String getRarity() { return rarity; }
    public String getImageUrl() { return imageUrl; }
}