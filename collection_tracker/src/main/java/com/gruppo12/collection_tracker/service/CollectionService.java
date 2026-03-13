package com.gruppo12.collection_tracker.service;

import com.gruppo12.collection_tracker.model.Card;
import com.gruppo12.collection_tracker.model.Collection;
import com.gruppo12.collection_tracker.repository.CollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CollectionService {

    @Autowired
    private CollectionRepository collectionRepository;

    // aggiunge una carta (temporaneo test)
    public Collection addCard(String username, Card card) {
        Collection collection = collectionRepository.findByUsername(username);
        collection.getCards().add(card);
        return collectionRepository.save(collection);
    }

    // rimuove una carta per nome
    public Collection removeCard(String username, String cardName) {
        Collection collection = collectionRepository.findByUsername(username);
        collection.getCards().removeIf(c -> c.getName().equals(cardName));
        return collectionRepository.save(collection);
    }

    // ritorna la collezione dell'utente
    public Collection getCollection(String username) {
        return collectionRepository.findByUsername(username);
    }
}
