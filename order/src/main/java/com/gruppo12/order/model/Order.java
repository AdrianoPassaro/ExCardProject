package com.gruppo12.order.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String buyerUsername;
    private String sellerUsername;
    private String buyerAddress;

    private List<OrderItem> items;

    private double totalPrice;
    private double shippingCost;
    private double finalPrice;

    private OrderStatus status;
    private Instant createdAt;

    /**
     * Voto lasciato dal compratore (1–5). 0 = non ancora valutato.
     * Salvato nell'ordine per impedire recensioni duplicate: se > 0
     * il frontend non mostra più il pulsante "Aggiungi recensione".
     */
    private int buyerRating = 0;

    public Order() {}

    public Order(String buyerUsername, String sellerUsername, String buyerAddress,
                 List<OrderItem> items, double totalPrice, double shippingCost,
                 double finalPrice) {
        this.buyerUsername  = buyerUsername;
        this.sellerUsername = sellerUsername;
        this.buyerAddress   = buyerAddress;
        this.items          = items;
        this.totalPrice     = totalPrice;
        this.shippingCost   = shippingCost;
        this.finalPrice     = finalPrice;
        this.status         = OrderStatus.IN_ATTESA;
        this.createdAt      = Instant.now();
        this.buyerRating    = 0;
    }

    public String getId()                              { return id; }
    public String getBuyerUsername()                   { return buyerUsername; }
    public void   setBuyerUsername(String v)           { this.buyerUsername = v; }
    public String getSellerUsername()                  { return sellerUsername; }
    public void   setSellerUsername(String v)          { this.sellerUsername = v; }
    public String getBuyerAddress()                    { return buyerAddress; }
    public void   setBuyerAddress(String v)            { this.buyerAddress = v; }
    public List<OrderItem> getItems()                  { return items; }
    public void            setItems(List<OrderItem> v) { this.items = v; }
    public double getTotalPrice()                      { return totalPrice; }
    public void   setTotalPrice(double v)              { this.totalPrice = v; }
    public double getShippingCost()                    { return shippingCost; }
    public void   setShippingCost(double v)            { this.shippingCost = v; }
    public double getFinalPrice()                      { return finalPrice; }
    public void   setFinalPrice(double v)              { this.finalPrice = v; }
    public OrderStatus getStatus()                     { return status; }
    public void        setStatus(OrderStatus v)        { this.status = v; }
    public Instant getCreatedAt()                      { return createdAt; }
    public void    setCreatedAt(Instant v)             { this.createdAt = v; }
    public int  getBuyerRating()                       { return buyerRating; }
    public void setBuyerRating(int v)                  { this.buyerRating = v; }
}