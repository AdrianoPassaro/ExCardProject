package com.gruppo12.collection_tracker.controller;

import com.gruppo12.collection_tracker.model.Card;
import com.gruppo12.collection_tracker.model.Collection;
import com.gruppo12.collection_tracker.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/collection")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    // Ottiene la collezione dell'utente autenticato
    @GetMapping
    public ResponseEntity<Collection> getCollection(@RequestHeader("username") String username) {
        Collection col = collectionService.getOrCreateCollection(username);
        return ResponseEntity.ok(col);
    }

    // Aggiorna quantità carta (+/-)
    @PatchMapping("/card")
    public ResponseEntity<Collection> updateCardQuantity(
            @RequestHeader("username") String username,
            @RequestBody Map<String, Object> body) {

        String name = (String) body.get("name");
        String rarity = (String) body.get("rarity");
        String condition = (String) body.get("condition");
        int delta = (int) body.get("delta");

        Collection updated = collectionService.updateCardQuantity(username, name, rarity, condition, delta);
        return ResponseEntity.ok(updated);
    }

    // Aggiunge carta (se esiste aggiorna quantità)
    @PostMapping("/add")
    public ResponseEntity<Collection> addCard(
            @RequestHeader("username") String username,
            @RequestBody Card newCard) {

        Collection updated = collectionService.addCard(username, newCard);
        return ResponseEntity.ok(updated);
    }
}