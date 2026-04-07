package com.gruppo12.listing.controller;

import com.gruppo12.listing.dto.CreateListingRequest;
import com.gruppo12.listing.dto.ListingResponse;
import com.gruppo12.listing.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.gruppo12.listing.dto.SearchListingCardResponse;

import java.util.List;

@RestController
@RequestMapping("/listings")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping
    public ListingResponse createListing(
            @AuthenticationPrincipal String sellerUsername,
            @Valid @RequestBody CreateListingRequest request) {

        return new ListingResponse(
                listingService.createListing(sellerUsername, request)
        );
    }

    @GetMapping
    public List<ListingResponse> getListings() {

        return listingService.getListings()
                .stream()
                .map(ListingResponse::new)
                .toList();
    }

    @GetMapping("/card/{cardId}")
    public List<ListingResponse> getListingsByCard(@PathVariable String cardId) {
        return listingService.getActiveListingsByCard(cardId)
                .stream()
                .map(ListingResponse::new)
                .toList();
    }

    @GetMapping("/search")
    public List<SearchListingCardResponse> searchCards(@RequestParam String q) {
        return listingService.searchCards(q);
    }

    @GetMapping("/seller/{sellerUsername}")
    public List<ListingResponse> getListingsBySeller(@PathVariable String sellerUsername) {
        return listingService.getActiveListingsBySeller(sellerUsername)
                .stream()
                .map(ListingResponse::new)
                .toList();
    }
}