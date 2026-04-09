package com.gruppo12.collection_tracker.dto;

public class TradeAvailabilityCheckResponse {

    private boolean available;

    public TradeAvailabilityCheckResponse() {
    }

    public TradeAvailabilityCheckResponse(boolean available) {
        this.available = available;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}