package com.gruppo12.cards_catalog.repository;

import com.gruppo12.cards_catalog.model.CardDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends MongoRepository<CardDocument, String> {

    Optional<CardDocument> findByNameAndSetNameAndNumber(
            String name,
            String setName,
            String number
    );

    List<CardDocument> findByNameContainingIgnoreCase(String name);

}