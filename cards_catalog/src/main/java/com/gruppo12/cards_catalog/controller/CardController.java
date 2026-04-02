package com.gruppo12.cards_catalog.controller;

import com.gruppo12.cards_catalog.dto.CardResponse;
import com.gruppo12.cards_catalog.dto.CreateCardRequest;
import com.gruppo12.cards_catalog.model.CardDocument;
import com.gruppo12.cards_catalog.service.CardService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cards")
public class CardController {

    private final CardService service;

    public CardController(CardService service) {
        this.service = service;
    }

    @PostMapping
    public CardResponse createCard(@Valid @RequestBody CreateCardRequest request) {

        CardDocument card = service.createCard(request);

        return new CardResponse(card);
    }

    @GetMapping
    public List<CardDocument> getCards() {
        return service.getCards();
    }

    @GetMapping("/{id}")
    public CardDocument getCard(@PathVariable String id) {
        return service.getCard(id);
    }

    @GetMapping("/search")
    public List<CardResponse> searchCards(@RequestParam String q) {
        return service.searchCardsByName(q)
                .stream()
                .map(CardResponse::new)
                .toList();
    }
}