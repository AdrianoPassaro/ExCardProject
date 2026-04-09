package com.gruppo12.trading_tool.service;

public class TradeStatusHelper {

    private TradeStatusHelper() {
    }

    public static boolean isListingTradable(TradeService.ListingDetails listing) {
        return listing != null
                && listing.getQuantity() > 0
                && "ACTIVE".equalsIgnoreCase(listing.getStatus());
    }
}