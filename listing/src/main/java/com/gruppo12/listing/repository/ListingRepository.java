package com.gruppo12.listing.repository;

import com.gruppo12.listing.model.ListingDocument;
import com.gruppo12.listing.model.ListingStatus;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ListingRepository extends MongoRepository<ListingDocument, String> {

    List<ListingDocument> findByCardId(String cardId);

    List<ListingDocument> findBySellerUsername(String sellerUsername);

    List<ListingDocument> findByStatus(ListingStatus status);

    List<ListingDocument> findByCardIdAndStatus(String cardId, ListingStatus status);

}
