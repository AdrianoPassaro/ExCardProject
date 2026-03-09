package com.gruppo12.card_loader.service;

import com.gruppo12.card_loader.dto.CreateCardRequest;
import com.gruppo12.card_loader.exception.CardNotFoundException;
import com.gruppo12.card_loader.model.CardDocument;
import com.gruppo12.card_loader.repository.CardRepository;
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
}