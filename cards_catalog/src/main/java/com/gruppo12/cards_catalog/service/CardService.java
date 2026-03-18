package com.gruppo12.cards_catalog.service;

import com.gruppo12.cards_catalog.dto.CreateCardRequest;
import com.gruppo12.cards_catalog.exception.CardNotFoundException;
import com.gruppo12.cards_catalog.model.CardDocument;
import com.gruppo12.cards_catalog.repository.CardRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardService {

    private final CardRepository repository;

    public CardService(CardRepository repository) {
        this.repository = repository;
    }

    public CardDocument createCard(CreateCardRequest request) {

        CardDocument card = new CardDocument(
                request.getName(),
                request.getSetName(),
                request.getNumber(),
                request.getRarity(),
                request.getImageUrl()
        );

        return repository.save(card);
    }

    public List<CardDocument> getCards() {
        return repository.findAll();
    }

    public CardDocument getCard(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new CardNotFoundException(id));
    }

    public List<CardDocument> searchCards(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }
}