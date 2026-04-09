package com.gruppo12.trading_tool.exception;

public class ForbiddenTradeActionException extends RuntimeException {
    public ForbiddenTradeActionException(String message) {
        super(message);
    }
}
