package com.gruppo12.listing.service;

import com.gruppo12.listing.dto.CreateListingRequest;
import com.gruppo12.listing.exception.ListingNotFoundException;
import com.gruppo12.listing.model.ListingDocument;
import com.gruppo12.listing.model.ListingStatus;
import com.gruppo12.listing.repository.ListingRepository;
import com.gruppo12.listing.dto.SearchListingCardResponse;
import com.gruppo12.listing.dto.CatalogCardResponse;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.List;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public ListingService(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    public ListingDocument createListing(String sellerUsername, CreateListingRequest request) {

        String url = "http://catalog-service:8082/cards/" + request.getCardId();

        try {
            restTemplate.getForObject(url, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("Card not found in catalog");
        }

        ListingDocument listing = new ListingDocument(
                request.getCardId(),
                sellerUsername,
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

    public List<ListingDocument> getActiveListingsByCard(String cardId) {
        return listingRepository.findByCardIdAndStatus(cardId, ListingStatus.ACTIVE);
    }

    public List<SearchListingCardResponse> searchCards(String query) {

        String normalizedQuery = query == null ? "" : query.trim();

        if (normalizedQuery.isBlank()) {
            return List.of();
        }

        String url = UriComponentsBuilder
                .fromUriString("http://catalog-service:8082/cards/search")
                .queryParam("q", normalizedQuery)
                .build()
                .toUriString();

        System.out.println("Searching catalog with URL: " + url);

        CatalogCardResponse[] cards;

        try {
            cards = restTemplate.getForObject(url, CatalogCardResponse[].class);
            System.out.println("Cards received from catalog: " + (cards == null ? "null" : cards.length));
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Error while searching cards in catalog: " + ex.getMessage());
        }

        if (cards == null) {
            return List.of();
        }

        try {
            return Arrays.stream(cards)
                    .map(card -> {
                        List<ListingDocument> activeListings =
                                listingRepository.findByCardIdAndStatus(card.getId(), ListingStatus.ACTIVE);

                        Double averagePrice = activeListings.isEmpty()
                                ? null
                                : activeListings.stream()
                                .mapToDouble(ListingDocument::getPrice)
                                .average()
                                .orElse(0.0);

                        return new SearchListingCardResponse(
                                card.getId(),
                                card.getName(),
                                card.getSetName(),
                                card.getNumber(),
                                card.getImageUrl(),
                                averagePrice
                        );
                    })
                    .toList();
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Error while processing search results: " + ex.getMessage());
        }
    }

    public List<ListingDocument> getActiveListingsBySeller(String sellerUsername) {
        return listingRepository.findBySellerUsernameAndStatus(sellerUsername, ListingStatus.ACTIVE);
    }
}
