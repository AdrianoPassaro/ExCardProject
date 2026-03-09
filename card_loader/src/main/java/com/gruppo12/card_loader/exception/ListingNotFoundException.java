package com.gruppo12.card_loader.exception;

public class ListingNotFoundException extends RuntimeException {

    public ListingNotFoundException(String id) {
        super("Listing not found with id: " + id);
    }

}