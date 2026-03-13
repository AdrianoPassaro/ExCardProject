package com.gruppo12.collection_tracker.repository;

import com.gruppo12.collection_tracker.model.Collection;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CollectionRepository extends MongoRepository<Collection, String> {
        Collection findByUsername(String username);
}
