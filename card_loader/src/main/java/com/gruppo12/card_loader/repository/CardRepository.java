package com.gruppo12.card_loader.repository;

import com.gruppo12.card_loader.model.CardDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CardRepository extends MongoRepository<CardDocument, String> {

}