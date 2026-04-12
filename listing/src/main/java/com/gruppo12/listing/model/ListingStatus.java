package com.gruppo12.listing.model;

public enum ListingStatus {
    ACTIVE,
    RESERVED,   // nel carrello di qualcuno — non visibile ad altri
    SOLD,        // venduto (futuro)
    SOLD_OUT
}
