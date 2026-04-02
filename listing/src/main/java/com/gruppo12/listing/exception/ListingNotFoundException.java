package com.gruppo12.listing.exception;

public class ListingNotFoundException extends RuntimeException {

    public ListingNotFoundException(String id) {
        super("Listing not found: " + id);
    }

}