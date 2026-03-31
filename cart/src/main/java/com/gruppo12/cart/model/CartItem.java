package com.gruppo12.cart.model;

public class CartItem {

    private String listingId;
    private String cardId;

    private String name;
    private String imageUrl;

    private String sellerUsername;
    private double price;

    public CartItem() {}

    public String getListingId() { return listingId; }
    public void setListingId(String listingId) { this.listingId = listingId; }

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getSellerUsername() { return sellerUsername; }
    public void setSellerUsername(String sellerUsername) { this.sellerUsername = sellerUsername; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}