package com.gruppo12.card_loader.service;

import com.gruppo12.card_loader.dto.CreateListingRequest;
import com.gruppo12.card_loader.exception.CardNotFoundException;
import com.gruppo12.card_loader.exception.ListingNotFoundException;
import com.gruppo12.card_loader.model.ListingDocument;
import com.gruppo12.card_loader.repository.CardRepository;
import com.gruppo12.card_loader.repository.ListingRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final CardRepository cardRepository;

    public ListingService(ListingRepository listingRepository,
                          CardRepository cardRepository) {
        this.listingRepository = listingRepository;
        this.cardRepository = cardRepository;
    }

    public ListingDocument createListing(String sellerId, CreateListingRequest request) {

        cardRepository.findById(request.getCardId())
                .orElseThrow(() -> new CardNotFoundException(request.getCardId()));

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

}