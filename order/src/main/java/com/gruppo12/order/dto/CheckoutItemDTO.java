package com.gruppo12.order.dto;

public class CheckoutItemDTO {

    private String listingId;
    private String cardId;
    private String cardName;
    private String sellerId;
    private String condition;
    private int    quantity;
    private double price;

    public String getListingId()              { return listingId; }
    public void   setListingId(String v)      { this.listingId = v; }

    public String getCardId()                 { return cardId; }
    public void   setCardId(String v)         { this.cardId = v; }

    public String getCardName()               { return cardName; }
    public void   setCardName(String v)       { this.cardName = v; }

    public String getSellerId()               { return sellerId; }
    public void   setSellerId(String v)       { this.sellerId = v; }

    public String getCondition()              { return condition; }
    public void   setCondition(String v)      { this.condition = v; }

    public int    getQuantity()               { return quantity; }
    public void   setQuantity(int v)          { this.quantity = v; }

    public double getPrice()                  { return price; }
    public void   setPrice(double v)          { this.price = v; }
}
