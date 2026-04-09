package com.gruppo12.collection_tracker.dto;

import java.util.List;

public class CompleteTradeCollectionRequest {

    private String proposerUsername;
    private String recipientUsername;
    private List<TradeCollectionItemRequest> itemsFromProposerToRecipient;
    private List<TradeCollectionItemRequest> itemsFromRecipientToProposer;

    public CompleteTradeCollectionRequest() {
    }

    public String getProposerUsername() {
        return proposerUsername;
    }

    public String getRecipientUsername() {
        return recipientUsername;
    }

    public List<TradeCollectionItemRequest> getItemsFromProposerToRecipient() {
        return itemsFromProposerToRecipient;
    }

    public List<TradeCollectionItemRequest> getItemsFromRecipientToProposer() {
        return itemsFromRecipientToProposer;
    }

    public void setProposerUsername(String proposerUsername) {
        this.proposerUsername = proposerUsername;
    }

    public void setRecipientUsername(String recipientUsername) {
        this.recipientUsername = recipientUsername;
    }

    public void setItemsFromProposerToRecipient(List<TradeCollectionItemRequest> itemsFromProposerToRecipient) {
        this.itemsFromProposerToRecipient = itemsFromProposerToRecipient;
    }

    public void setItemsFromRecipientToProposer(List<TradeCollectionItemRequest> itemsFromRecipientToProposer) {
        this.itemsFromRecipientToProposer = itemsFromRecipientToProposer;
    }
}