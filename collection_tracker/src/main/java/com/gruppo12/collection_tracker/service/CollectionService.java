package com.gruppo12.collection_tracker.service;

import com.gruppo12.collection_tracker.dto.CardResponse;
import com.gruppo12.collection_tracker.dto.CollectionResponse;
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

    private final String CARD_SERVICE_URL = "http://localhost:8082/cards/";

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
            if(c.getCardId() == null) continue;

            Map data = null;
            try {
                data = restTemplate.getForObject(CARD_SERVICE_URL + c.getCardId(), Map.class);
            } catch(Exception e) {
                System.out.println("Errore chiamata card-service: " + c.getCardId());
                continue;
            }

            if(data == null) continue;

            CardResponse cr = new CardResponse();
            cr.setCardId(c.getCardId());
            cr.setCondition(c.getCondition());
            cr.setQuantity(c.getQuantity());

            cr.setName((String) data.get("name"));
            cr.setRarity((String) data.get("rarity"));
            cr.setExpansion((String) data.get("setName")); // era setName nel catalog
            cr.setImageUrl((String) data.get("imageUrl"));

            result.add(cr);
        }

        return new CollectionResponse(result);
    }

    public Collection addCard(String username, Card newCard) {
        if(newCard.getCardId() == null) return getOrCreateCollection(username);

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
}