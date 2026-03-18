package com.gruppo12.listing.service;

import com.gruppo12.listing.dto.CreateListingRequest;
import com.gruppo12.listing.exception.ListingNotFoundException;
import com.gruppo12.listing.model.ListingDocument;
import com.gruppo12.listing.model.ListingStatus;
import com.gruppo12.listing.repository.ListingRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public ListingService(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    public ListingDocument createListing(String sellerId, CreateListingRequest request) {

        String url = "http://catalog_service:8082/cards/" + request.getCardId();

        try {
            restTemplate.getForObject(url, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("Card not found in catalog");
        }

        ListingDocument listing = new ListingDocument(
                request.getCardId(),
                sellerId,
                request.getCondition(),
                request.getPrice(),
                request.getQuantity()
        );

        return listingRepository.save(listing);
    }

    public List<ListingDocument> getListings() {
        return listingRepository.findAll();
    }

    public ListingDocument getListing(String id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new ListingNotFoundException(id));
    }

    public List<ListingDocument> getActiveListings() {
        return listingRepository.findByStatus(ListingStatus.ACTIVE);
    }

}
