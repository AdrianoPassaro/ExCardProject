package com.gruppo12.card_loader.repository;

import com.gruppo12.card_loader.model.LoadRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoadRequestRepository extends MongoRepository<LoadRequest, String> {

    List<LoadRequest> findByUserId(String userId);

    List<LoadRequest> findByApprovedTrue();

    List<LoadRequest> findByApprovedFalse();

    List<LoadRequest> findByCardNameContainingIgnoreCase(String cardName);

    List<LoadRequest> findByCardSet(String cardSet);

    List<LoadRequest> findByCondition(LoadRequest.CardCondition condition);

    List<LoadRequest> findByCardNameContainingIgnoreCaseAndCardSet(String cardName, String cardSet);
}