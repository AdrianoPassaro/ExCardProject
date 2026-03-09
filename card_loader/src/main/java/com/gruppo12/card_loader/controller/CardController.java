package com.gruppo12.card_loader.controller;

import com.gruppo12.card_loader.dto.CardResponse;
import com.gruppo12.card_loader.dto.CreateCardRequest;
import com.gruppo12.card_loader.model.CardDocument;
import com.gruppo12.card_loader.service.CardService;

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
    public List<CardResponse> getCards() {

        return service.getCards()
                .stream()
                .map(CardResponse::new)
                .toList();
    }

}
