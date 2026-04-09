package com.gruppo12.trading_tool.exception;

public class TradeNotFoundException extends RuntimeException {
    public TradeNotFoundException(String id) {
        super("Trade non trovato: " + id);
    }
}