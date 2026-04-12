package com.gruppo12.listing.controller;

import com.gruppo12.listing.dto.CreateListingRequest;
import com.gruppo12.listing.dto.ListingResponse;
import com.gruppo12.listing.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.gruppo12.listing.dto.SearchListingCardResponse;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/listings")
@CrossOrigin("*")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping
    public ListingResponse createListing(
            @AuthenticationPrincipal String sellerUsername,
            @Valid @RequestBody CreateListingRequest request) {
        return new ListingResponse(listingService.createListing(sellerUsername, request));
    }

    @GetMapping
    public List<ListingResponse> getListings() {
        return listingService.getListings().stream().map(ListingResponse::new).toList();
    }

    @GetMapping("/card/{cardId}")
    public List<ListingResponse> getListingsByCard(@PathVariable String cardId) {
        return listingService.getActiveListingsByCard(cardId).stream().map(ListingResponse::new).toList();
    }

    @GetMapping("/search")
    public List<SearchListingCardResponse> searchCards(@RequestParam String q) {
        return listingService.searchCards(q);
    }

    @GetMapping("/{id}")
    public ListingResponse getListing(@PathVariable String id) {
        return new ListingResponse(listingService.getListing(id));
    }

    @GetMapping("/seller/{sellerUsername}")
    public List<ListingResponse> getListingsBySeller(@PathVariable String sellerUsername) {
        return listingService.getActiveListingsBySeller(sellerUsername).stream().map(ListingResponse::new).toList();
    }

    /**
     * Chiamato da cart service (o frontend) quando una carta viene aggiunta al carrello.
     * Scala la quantità richiesta. Se arriva a 0, mette il listing in stato RESERVED.
     */
    @PatchMapping("/{id}/reserve")
    public ListingResponse reserve(@PathVariable String id, @RequestParam int qty) {
        return new ListingResponse(listingService.reserve(id, qty));
    }

    /**
     * Chiamato quando la carta viene rimossa dal carrello.
     * Riaggiunge la quantità al listing.
     */
    @PatchMapping("/{id}/release")
    public ListingResponse release(@PathVariable String id, @RequestParam int qty) {
        return new ListingResponse(listingService.release(id, qty));
    }

    @PatchMapping("/quantity")
    public void updateQuantity(@RequestBody Map<String, Object> body) {
        String listingId = (String) body.get("listingId");
        int delta = (int) body.get("delta");
        listingService.updateQuantity(listingId, delta);
    }
}