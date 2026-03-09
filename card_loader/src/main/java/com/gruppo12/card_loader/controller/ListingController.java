package com.gruppo12.card_loader.controller;

import com.gruppo12.card_loader.dto.CreateListingRequest;
import com.gruppo12.card_loader.dto.ListingResponse;
import com.gruppo12.card_loader.model.ListingDocument;
import com.gruppo12.card_loader.service.ListingService;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/listings")
public class ListingController {

    private final ListingService service;

    public ListingController(ListingService service) {
        this.service = service;
    }

    @PostMapping
    public ListingResponse createListing(
            @AuthenticationPrincipal String sellerId,
            @Valid @RequestBody CreateListingRequest request) {

        ListingDocument listing = service.createListing(sellerId, request);

        return new ListingResponse(listing);
    }

    @GetMapping
    public List<ListingResponse> getListings() {

        return service.getListings()
                .stream()
                .map(ListingResponse::new)
                .toList();
    }

}