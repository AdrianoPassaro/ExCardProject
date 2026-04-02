package com.gruppo12.order.dto;

public class CheckoutResponse {

    private boolean success;
    private String message;

    public CheckoutResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
}
