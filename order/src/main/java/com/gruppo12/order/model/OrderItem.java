package com.gruppo12.order.model;

public class OrderItem {

    private String cardId;
    private String cardName;    // snapshot al momento dell'ordine
    private String condition;
    private int    quantity;
    private double price;
    private String sellerUsername;

    public OrderItem() {}

    public OrderItem(String cardId, String cardName, String condition,
                     int quantity, double price, String sellerUsername) {
        this.cardId          = cardId;
        this.cardName        = cardName;
        this.condition       = condition;
        this.quantity        = quantity;
        this.price           = price;
        this.sellerUsername  = sellerUsername;
    }

    public String getCardId()                      { return cardId; }
    public void   setCardId(String v)              { this.cardId = v; }

    public String getCardName()                    { return cardName; }
    public void   setCardName(String v)            { this.cardName = v; }

    public String getCondition()                   { return condition; }
    public void   setCondition(String v)           { this.condition = v; }

    public int    getQuantity()                    { return quantity; }
    public void   setQuantity(int v)               { this.quantity = v; }

    public double getPrice()                       { return price; }
    public void   setPrice(double v)               { this.price = v; }

    public String getSellerUsername()              { return sellerUsername; }
    public void   setSellerUsername(String v)      { this.sellerUsername = v; }
}