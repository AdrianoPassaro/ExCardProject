package com.gruppo12.order.dto;

import java.util.List;

/**
 * Payload inviato da checkout.js DOPO che il pagamento è già avvenuto.
 * L'order service non tocca il payment, si limita a creare gli ordini.
 */
public class CheckoutRequest {

    private String buyerUsername;
    private String buyerAddress;   // "Nome Cognome · Via X · CAP Città (PR)"
    private List<CheckoutItemDTO> items;

    public String getBuyerUsername()                  { return buyerUsername; }
    public void   setBuyerUsername(String v)          { this.buyerUsername = v; }

    public String getBuyerAddress()                   { return buyerAddress; }
    public void   setBuyerAddress(String v)           { this.buyerAddress = v; }

    public List<CheckoutItemDTO> getItems()           { return items; }
    public void                  setItems(List<CheckoutItemDTO> v) { this.items = v; }
}