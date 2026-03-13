package com.gruppo12.collection_tracker.model;

public class Card {
    private String name;
    private String rarity;
    private String expansion;
    private String imageUrl;
    private String condition; // nearmint, lightly played, etc.
    // in realtà dovrebbe avere cardid, condizione e quantità


    public Card() {}

    public Card(String name, String rarity, String expansion, String condition, String imageUrl) {
        this.name = name;
        this.rarity = rarity;
        this.expansion = expansion;
        this.imageUrl = imageUrl;
        this.condition = condition;
    }

    // getter e setter
    public String getName() { return name; }
    //public void setName(String name) { this.name = name; }

    public String getRarity() { return rarity; }
    //public void setRarity(String rarity) { this.rarity = rarity; }

    public String getExpansion() { return expansion; }
    //public void setExpansion(String expansion) { this.expansion = expansion; }

    public String getImageUrl() { return imageUrl; }
    //public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
}