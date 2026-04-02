package com.gruppo12.cards_catalog.exception;

public class CardNotFoundException extends RuntimeException {

    public CardNotFoundException(String id) {
        super("Card not found: " + id);
    }

}