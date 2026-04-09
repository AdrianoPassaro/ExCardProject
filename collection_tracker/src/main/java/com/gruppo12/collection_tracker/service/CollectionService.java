package com.gruppo12.collection_tracker.service;

import com.gruppo12.collection_tracker.dto.CardResponse;
import com.gruppo12.collection_tracker.dto.CollectionResponse;
import com.gruppo12.collection_tracker.dto.CompleteTradeCollectionRequest;
import com.gruppo12.collection_tracker.dto.TradeCollectionItemRequest;
import com.gruppo12.collection_tracker.model.Card;
import com.gruppo12.collection_tracker.model.Collection;
import com.gruppo12.collection_tracker.repository.CollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class CollectionService {

    @Autowired
    private CollectionRepository repository;

    @Autowired
    private RestTemplate restTemplate;

    private final String CARD_SERVICE_URL = "http://cards-catalog:8082/cards/";

    public Collection getOrCreateCollection(String username) {
        Collection collection = repository.findByUsername(username);
        if (collection == null) {
            collection = new Collection();
            collection.setUsername(username);
            collection.setCards(new ArrayList<>());
            repository.save(collection);
        }
        return collection;
    }

    public CollectionResponse getFullCollection(String username) {
        Collection collection = getOrCreateCollection(username);

        List<CardResponse> result = new ArrayList<>();

        for (Card c : collection.getCards()) {

            if (c.getCardId() == null) continue;

            CardResponse cardData;

            try {
                System.out.println("Chiamo card-service con ID: " + c.getCardId());

                cardData = restTemplate.getForObject(
                        CARD_SERVICE_URL + c.getCardId(),
                        CardResponse.class
                );

            } catch (Exception e) {
                System.out.println("Errore chiamata card-service: " + c.getCardId());
                continue;
            }

            if (cardData == null) continue;

            CardResponse cr = new CardResponse();
            cr.setCardId(c.getCardId());
            cr.setCondition(c.getCondition());
            cr.setQuantity(c.getQuantity());

            cr.setName(cardData.getName());
            cr.setRarity(cardData.getRarity());
            cr.setSetName(cardData.getSetName());
            cr.setImageUrl(cardData.getImageUrl());

            result.add(cr);
        }

        return new CollectionResponse(result);
    }

    public Collection addCard(String username, Card newCard) {

        if (newCard.getCardId() == null)
            return getOrCreateCollection(username);

        Collection collection = getOrCreateCollection(username);

        Card existing = collection.getCards().stream()
                .filter(c -> c.getCardId() != null
                        && c.getCardId().equals(newCard.getCardId())
                        && c.getCondition().equals(newCard.getCondition()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + newCard.getQuantity());
        } else {
            collection.getCards().add(newCard);
        }

        return repository.save(collection);
    }

    public Collection updateCardQuantity(String username, String cardId, String condition, int delta) {

        Collection collection = getOrCreateCollection(username);

        Card card = collection.getCards().stream()
                .filter(c -> c.getCardId() != null
                        && c.getCardId().equals(cardId)
                        && c.getCondition().equals(condition))
                .findFirst()
                .orElse(null);

        if (card != null) {
            card.setQuantity(card.getQuantity() + delta);

            if (card.getQuantity() <= 0) {
                collection.getCards().remove(card);
            }

            return repository.save(collection);
        }

        return collection;
    }

    public Collection getCollectionByUsername(String username) {
        Collection collection = repository.findByUsername(username);

        if (collection == null) {
            Collection newCollection = new Collection();
            newCollection.setUsername(username);
            newCollection.setCards(new java.util.ArrayList<>());
            return repository.save(newCollection);
        }

        return collection;
    }

    public boolean hasAllTradeItems(String username, List<TradeCollectionItemRequest> items) {
        Collection collection = repository.findByUsername(username);

        if (collection == null || collection.getCards() == null) {
            return false;
        }

        for (TradeCollectionItemRequest item : items) {
            boolean available = collection.getCards().stream().anyMatch(card ->
                    item.getCardId().equals(card.getCardId())
                            && item.getCondition().equals(card.getCondition())
                            && card.getQuantity() >= item.getQuantity()
            );

            if (!available) {
                return false;
            }
        }

        return true;
    }

    public void completeTrade(CompleteTradeCollectionRequest request) {
        Collection proposerCollection = repository.findByUsername(request.getProposerUsername());
        Collection recipientCollection = repository.findByUsername(request.getRecipientUsername());

        if (proposerCollection == null || recipientCollection == null) {
            throw new RuntimeException("Collezione di uno dei due utenti non trovata");
        }

        if (!hasAllTradeItems(request.getProposerUsername(), request.getItemsFromProposerToRecipient())) {
            throw new RuntimeException("Il proponente non possiede più tutte le carte offerte");
        }

        if (!hasAllTradeItems(request.getRecipientUsername(), request.getItemsFromRecipientToProposer())) {
            throw new RuntimeException("Il destinatario non possiede più tutte le carte richieste");
        }

        for (TradeCollectionItemRequest item : request.getItemsFromProposerToRecipient()) {
            removeCardQuantity(proposerCollection, item.getCardId(), item.getCondition(), item.getQuantity());
            addCardQuantity(recipientCollection, item.getCardId(), item.getCondition(), item.getQuantity());
        }

        for (TradeCollectionItemRequest item : request.getItemsFromRecipientToProposer()) {
            removeCardQuantity(recipientCollection, item.getCardId(), item.getCondition(), item.getQuantity());
            addCardQuantity(proposerCollection, item.getCardId(), item.getCondition(), item.getQuantity());
        }

        repository.save(proposerCollection);
        repository.save(recipientCollection);
    }

    private void removeCardQuantity(Collection collection, String cardId, String condition, int quantity) {
        Card card = collection.getCards().stream()
                .filter(c -> cardId.equals(c.getCardId()) && condition.equals(c.getCondition()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Carta non trovata in collezione"));

        if (card.getQuantity() < quantity) {
            throw new RuntimeException("Quantità insufficiente");
        }

        card.setQuantity(card.getQuantity() - quantity);

        collection.getCards().removeIf(c -> c.getQuantity() <= 0);
    }

    private void addCardQuantity(Collection collection, String cardId, String condition, int quantity) {
        Card existing = collection.getCards().stream()
                .filter(c -> cardId.equals(c.getCardId()) && condition.equals(c.getCondition()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
            return;
        }

        Card newCard = new Card();
        newCard.setCardId(cardId);
        newCard.setCondition(condition);
        newCard.setQuantity(quantity);

        collection.getCards().add(newCard);
    }
}