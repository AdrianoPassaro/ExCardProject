package com.gruppo12.listing.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ListingNotFoundException.class)
    public ResponseEntity<String> handleListingNotFound(ListingNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }

}