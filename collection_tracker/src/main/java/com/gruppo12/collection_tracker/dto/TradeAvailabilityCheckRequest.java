package com.gruppo12.collection_tracker.dto;

import java.util.List;

public class TradeAvailabilityCheckRequest {

    private List<TradeCollectionItemRequest> items;

    public TradeAvailabilityCheckRequest() {
    }

    public List<TradeCollectionItemRequest> getItems() {
        return items;
    }

    public void setItems(List<TradeCollectionItemRequest> items) {
        this.items = items;
    }
}
