package com.gruppo12.collection_tracker.controller;

import com.gruppo12.collection_tracker.dto.CollectionRequest;
import com.gruppo12.collection_tracker.model.Collection;
import com.gruppo12.collection_tracker.model.Card;
import com.gruppo12.collection_tracker.repository.CollectionRepository;
import com.gruppo12.collection_tracker.service.CollectionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/collection")
public class CollectionController {

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private CollectionService collectionService;

    // Ottiene la collezione dell'utente autenticato
    @GetMapping
    public ResponseEntity<Collection> getCollection(@AuthenticationPrincipal String username) {

        Collection collection = collectionRepository.findByUsername(username);

        if (collection == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(collection);
    }

    // Crea la collezione se non esiste
    @PostMapping
    public ResponseEntity<String> createCollection(@RequestBody CollectionRequest request) {

        try {

            Collection existing = collectionRepository.findByUsername(request.getUsername());

            if (existing != null) {
                return ResponseEntity.badRequest().body("Collezione già esistente");
            }

            Collection newCollection = new Collection();
            newCollection.setUsername(request.getUsername());
            newCollection.setCards(new ArrayList<Card>());

            collectionRepository.save(newCollection);

            System.out.println("Collezione creata per utente: " + request.getUsername());

            return ResponseEntity.ok("Collezione creata con successo");

        } catch (Exception e) {

            System.err.println("Errore creazione collezione: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore interno");
        }
    }

    // Rimuove una carta
    @DeleteMapping("/{cardName}")
    public ResponseEntity<Collection> removeCard(
            @AuthenticationPrincipal String username,
            @PathVariable String cardName) {

        Collection updated = collectionService.removeCard(username, cardName);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

}