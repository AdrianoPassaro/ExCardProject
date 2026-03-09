package com.gruppo12.card_loader.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CardNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleCardNotFound(CardNotFoundException ex) {
        return ex.getMessage();
    }

    @ExceptionHandler(ListingNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleListingNotFound(ListingNotFoundException ex) {
        return ex.getMessage();
    }

}