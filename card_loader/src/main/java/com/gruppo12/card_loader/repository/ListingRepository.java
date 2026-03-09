package com.gruppo12.card_loader.repository;

import com.gruppo12.card_loader.model.ListingDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ListingRepository extends MongoRepository<ListingDocument, String> {

    List<ListingDocument> findByCardId(String cardId);

    List<ListingDocument> findBySellerId(String sellerId);

}