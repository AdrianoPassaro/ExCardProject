package com.gruppo12.trading_tool.repository;

import com.gruppo12.trading_tool.model.TradeOfferDocument;
import com.gruppo12.trading_tool.model.TradeStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TradeRepository extends MongoRepository<TradeOfferDocument, String> {

    List<TradeOfferDocument> findByProposerUsernameOrderByCreatedAtDesc(String proposerUsername);

    List<TradeOfferDocument> findByRecipientUsernameOrderByCreatedAtDesc(String recipientUsername);

    List<TradeOfferDocument> findByStatusOrderByCreatedAtDesc(TradeStatus status);
}