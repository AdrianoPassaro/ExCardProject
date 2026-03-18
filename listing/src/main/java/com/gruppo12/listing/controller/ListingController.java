package com.gruppo12.listing.controller;

import com.gruppo12.listing.dto.CreateListingRequest;
import com.gruppo12.listing.dto.ListingResponse;
import com.gruppo12.listing.service.ListingService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/listings")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping
    public ListingResponse createListing(
            @RequestHeader("X-USER-ID") String sellerId,
            @RequestBody CreateListingRequest request) {

        return new ListingResponse(
                listingService.createListing(sellerId, request)
        );
    }

    @GetMapping
    public List<ListingResponse> getListings() {

        return listingService.getListings()
                .stream()
                .map(ListingResponse::new)
                .collect(Collectors.toList());
    }

}