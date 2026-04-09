package com.gruppo12.collection_tracker.controller;

import com.gruppo12.collection_tracker.dto.*;
import com.gruppo12.collection_tracker.model.Card;
import com.gruppo12.collection_tracker.model.Collection;
import com.gruppo12.collection_tracker.service.CollectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collection")
public class CollectionController {

    private final CollectionService service;

    public CollectionController(CollectionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<CollectionResponse> getCollection(@RequestHeader("username") String username) {
        return ResponseEntity.ok(service.getFullCollection(username));
    }

    @GetMapping("/public/{username}")
    public CollectionResponse getPublicCollection(@PathVariable String username) {
        Collection collection = service.getCollectionByUsername(username);

        List<CardResponse> cards = collection.getCards() == null
                ? List.of()
                : collection.getCards().stream()
                .map(card -> new CardResponse(
                        card.getCardId(),
                        card.getCondition(),
                        card.getQuantity()
                ))
                .toList();

        return new CollectionResponse(cards);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addCard(@RequestHeader("username") String username,
                                     @RequestBody Card card) {
        return ResponseEntity.ok(service.addCard(username, card));
    }

    @PostMapping("/user/{username}/check-trade-availability")
    public TradeAvailabilityCheckResponse checkTradeAvailability(
            @PathVariable String username,
            @RequestBody TradeAvailabilityCheckRequest request) {

        boolean available = service.hasAllTradeItems(username, request.getItems());
        return new TradeAvailabilityCheckResponse(available);
    }

    @PostMapping("/trades/complete")
    public void completeTrade(@RequestBody CompleteTradeCollectionRequest request) {
        service.completeTrade(request);
    }

    @PatchMapping("/card")
    public ResponseEntity<CollectionResponse> updateCard(@RequestHeader("username") String username,
                                                         @RequestBody Map<String, Object> body) {
        String cardId = (String) body.get("cardId");
        String condition = (String) body.get("condition");
        int delta = (int) body.get("delta");

        service.updateCardQuantity(username, cardId, condition, delta); // aggiorna la quantità
        // richiamo getFullCollection per ottenere dati completi
        return ResponseEntity.ok(service.getFullCollection(username));
    }
}