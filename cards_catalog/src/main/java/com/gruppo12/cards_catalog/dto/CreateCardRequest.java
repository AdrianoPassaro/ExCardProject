package com.gruppo12.cards_catalog.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCardRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String setName;

    @NotBlank
    private String number;

    private String rarity;
    private String imageUrl;

    public String getName() { return name; }
    public String getSetName() { return setName; }
    public String getNumber() { return number; }
    public String getRarity() { return rarity; }
    public String getImageUrl() { return imageUrl; }
}