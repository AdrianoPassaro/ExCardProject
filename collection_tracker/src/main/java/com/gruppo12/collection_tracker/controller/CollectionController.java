package com.gruppo12.collection_tracker.controller;

import com.gruppo12.collection_tracker.dto.CollectionResponse;
import com.gruppo12.collection_tracker.model.Card;
import com.gruppo12.collection_tracker.service.CollectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/add")
    public ResponseEntity<?> addCard(@RequestHeader("username") String username,
                                     @RequestBody Card card) {
        return ResponseEntity.ok(service.addCard(username, card));
    }

    @PatchMapping("/card")
    public ResponseEntity<?> updateCard(@RequestHeader("username") String username,
                                        @RequestBody Map<String, Object> body) {
        String cardId = (String) body.get("cardId");
        String condition = (String) body.get("condition");
        int delta = (int) body.get("delta");
        return ResponseEntity.ok(service.updateCardQuantity(username, cardId, condition, delta));
    }
}