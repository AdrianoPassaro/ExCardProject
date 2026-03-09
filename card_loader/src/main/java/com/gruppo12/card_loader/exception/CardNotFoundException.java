package com.gruppo12.card_loader.exception;

public class CardNotFoundException extends RuntimeException {

    public CardNotFoundException(String id) {
        super("Card not found with id: " + id);
    }

}