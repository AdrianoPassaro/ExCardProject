package com.gruppo12.collection_tracker.service;

import com.gruppo12.collection_tracker.model.Card;
import com.gruppo12.collection_tracker.model.Collection;
import com.gruppo12.collection_tracker.repository.CollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CollectionService {

    @Autowired
    private CollectionRepository collectionRepository;

    public Collection getOrCreateCollection(String username) {
        Collection collection = collectionRepository.findByUsername(username);
        if (collection == null) {
            collection = new Collection();
            collection.setUsername(username);
            collection.setCards(new ArrayList<>());
            collectionRepository.save(collection);
        }
        return collection;
    }

    public Collection addCard(String username, Card newCard) {
        Collection collection = getOrCreateCollection(username);

        Card existing = collection.getCards().stream()
                .filter(c -> c.getName().equals(newCard.getName())
                        && c.getRarity().equals(newCard.getRarity())
                        && c.getCondition().equals(newCard.getCondition()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + newCard.getQuantity());
        } else {
            collection.getCards().add(newCard);
        }

        return collectionRepository.save(collection);
    }

    public Collection updateCardQuantity(String username, String name, String rarity, String condition, int delta) {
        Collection collection = getOrCreateCollection(username);

        Card card = collection.getCards().stream()
                .filter(c -> c.getName().equals(name)
                        && c.getRarity().equals(rarity)
                        && c.getCondition().equals(condition))
                .findFirst()
                .orElse(null);

        if (card != null) {
            card.setQuantity(card.getQuantity() + delta);
            if (card.getQuantity() <= 0) {
                collection.getCards().remove(card);
            }
            return collectionRepository.save(collection);
        }

        return collection;
    }
}