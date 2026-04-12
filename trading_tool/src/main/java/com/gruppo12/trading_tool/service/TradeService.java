package com.gruppo12.trading_tool.service;

import com.gruppo12.trading_tool.dto.CounterTradeRequest;
import com.gruppo12.trading_tool.dto.CreateTradeRequest;
import com.gruppo12.trading_tool.dto.TradeItemRequest;
import com.gruppo12.trading_tool.exception.ForbiddenTradeActionException;
import com.gruppo12.trading_tool.exception.TradeNotFoundException;
import com.gruppo12.trading_tool.model.TradeItem;
import com.gruppo12.trading_tool.model.TradeOfferDocument;
import com.gruppo12.trading_tool.model.TradeStatus;
import com.gruppo12.trading_tool.repository.TradeRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.List;

@Service
public class TradeService {

    private final TradeRepository tradeRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public TradeService(TradeRepository tradeRepository) {
        this.tradeRepository = tradeRepository;
    }

    public TradeOfferDocument createTrade(String proposerUsername, String authHeader, CreateTradeRequest request) {
        ListingDetails listing = loadListing(request.getTargetListingId());

        if (!TradeStatusHelper.isListingTradable(listing)) {
            throw new RuntimeException("Il listing selezionato non è disponibile per uno scambio");
        }

        if (proposerUsername.equals(listing.getSellerUsername())) {
            throw new RuntimeException("Non puoi proporre uno scambio a te stesso");
        }

        validateOfferedItemsBelongToUser(proposerUsername, request.getOfferedItems(), authHeader);

        TradeOfferDocument trade = new TradeOfferDocument();
        trade.setProposerUsername(proposerUsername);
        trade.setRecipientUsername(listing.getSellerUsername());
        trade.setTargetListingId(listing.getId());
        trade.setTargetCardId(listing.getCardId());
        trade.setTargetCondition(listing.getCondition());
        trade.setTargetListingPrice(listing.getPrice());
        trade.setTargetQuantity(1);
        trade.setProposerMessage(request.getProposerMessage());
        trade.setStatus(TradeStatus.PENDING);
        trade.setCreatedAt(Instant.now());
        trade.setUpdatedAt(Instant.now());
        trade.setOfferedItems(
                request.getOfferedItems().stream()
                        .map(i -> new TradeItem(i.getCardId(), i.getCondition(), i.getQuantity()))
                        .toList()
        );

        return tradeRepository.save(trade);
    }

    public List<TradeOfferDocument> getIncomingTrades(String username) {
        return tradeRepository.findByRecipientUsernameOrderByCreatedAtDesc(username);
    }

    public List<TradeOfferDocument> getOutgoingTrades(String username) {
        return tradeRepository.findByProposerUsernameOrderByCreatedAtDesc(username);
    }

    public TradeOfferDocument getTrade(String tradeId, String username) {
        TradeOfferDocument trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new TradeNotFoundException(tradeId));

        if (!trade.getProposerUsername().equals(username) && !trade.getRecipientUsername().equals(username)) {
            throw new ForbiddenTradeActionException("Non puoi accedere a questo scambio");
        }

        return trade;
    }

    public TradeOfferDocument acceptTrade(String tradeId, String username, String authHeader) {
        TradeOfferDocument trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new TradeNotFoundException(tradeId));

        if (!trade.getRecipientUsername().equals(username)) {
            throw new ForbiddenTradeActionException("Solo il destinatario può accettare lo scambio");
        }

        if (trade.getStatus() != TradeStatus.PENDING && trade.getStatus() != TradeStatus.COUNTERED) {
            throw new RuntimeException("Questo scambio non può essere accettato");
        }

        trade.setStatus(TradeStatus.ACCEPTED);
        trade.setUpdatedAt(Instant.now());

        // Salva prima di completare
        TradeOfferDocument savedTrade = tradeRepository.save(trade);

        // Completa lo scambio (trasferimento carte) - passa anche authHeader
        completeTrade(savedTrade.getId(), username, authHeader);

        return savedTrade;
    }

    public TradeOfferDocument rejectTrade(String tradeId, String username) {
        TradeOfferDocument trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new TradeNotFoundException(tradeId));

        if (!trade.getRecipientUsername().equals(username)) {
            throw new ForbiddenTradeActionException("Solo il destinatario può rifiutare lo scambio");
        }

        if (trade.getStatus() != TradeStatus.PENDING && trade.getStatus() != TradeStatus.COUNTERED) {
            throw new RuntimeException("Questo scambio non può essere rifiutato");
        }

        trade.setStatus(TradeStatus.REJECTED);
        trade.setUpdatedAt(Instant.now());

        return tradeRepository.save(trade);
    }

    public TradeOfferDocument cancelTrade(String tradeId, String username) {
        TradeOfferDocument trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new TradeNotFoundException(tradeId));

        if (!trade.getProposerUsername().equals(username)) {
            throw new ForbiddenTradeActionException("Solo il proponente può annullare lo scambio");
        }

        if (trade.getStatus() == TradeStatus.COMPLETED || trade.getStatus() == TradeStatus.REJECTED) {
            throw new RuntimeException("Questo scambio non può essere annullato");
        }

        trade.setStatus(TradeStatus.CANCELLED);
        trade.setUpdatedAt(Instant.now());

        return tradeRepository.save(trade);
    }

    public TradeOfferDocument counterTrade(String tradeId, String username, String authHeader, CounterTradeRequest request) {
        TradeOfferDocument trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new TradeNotFoundException(tradeId));

        if (!trade.getRecipientUsername().equals(username)) {
            throw new ForbiddenTradeActionException("Solo il destinatario può fare una controproposta");
        }

        if (trade.getStatus() != TradeStatus.PENDING && trade.getStatus() != TradeStatus.COUNTERED) {
            throw new RuntimeException("Questo scambio non può essere modificato");
        }

        validateOfferedItemsBelongToUser(trade.getRecipientUsername(), request.getOfferedItems(), authHeader);

        trade.setOfferedItems(
                request.getOfferedItems().stream()
                        .map(i -> new TradeItem(i.getCardId(), i.getCondition(), i.getQuantity()))
                        .toList()
        );
        trade.setRecipientMessage(request.getRecipientMessage());
        trade.setStatus(TradeStatus.COUNTERED);
        trade.setUpdatedAt(Instant.now());

        return tradeRepository.save(trade);
    }

    public TradeOfferDocument completeTrade(String tradeId, String username, String authHeader) {
        TradeOfferDocument trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new TradeNotFoundException(tradeId));

        if (!trade.getProposerUsername().equals(username) && !trade.getRecipientUsername().equals(username)) {
            throw new ForbiddenTradeActionException("Non puoi completare questo scambio");
        }

        if (trade.getStatus() != TradeStatus.ACCEPTED) {
            throw new RuntimeException("Solo uno scambio accettato può essere completato");
        }

        CompleteTradePayload payload = new CompleteTradePayload(
                trade.getProposerUsername(),
                trade.getRecipientUsername(),
                trade.getOfferedItems(),
                List.of(new TradeItem(trade.getTargetCardId(), trade.getTargetCondition(), trade.getTargetQuantity()))
        );

        try {
            // Prepara headers con il token
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            headers.set("Content-Type", "application/json");

            HttpEntity<CompleteTradePayload> entity = new HttpEntity<>(payload, headers);

            restTemplate.exchange(
                    "http://collection-tracker:8083/api/collection/trades/complete",
                    HttpMethod.POST,
                    entity,
                    Void.class
            );
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Errore durante l'aggiornamento della collezione: " + ex.getMessage());
        }

        trade.setStatus(TradeStatus.COMPLETED);
        trade.setUpdatedAt(Instant.now());

        return tradeRepository.save(trade);
    }

    private ListingDetails loadListing(String listingId) {
        try {
            return restTemplate.getForObject(
                    "http://listing-service:8084/listings/" + listingId,
                    ListingDetails.class
            );
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Listing non trovato o non raggiungibile");
        }
    }

    private void validateOfferedItemsBelongToUser(String username, List<TradeItemRequest> items, String authHeader) {
        try {
            String url = UriComponentsBuilder
                    .fromUriString("http://collection-tracker:8083/api/collection/user/{username}/check-trade-availability")
                    .buildAndExpand(username)
                    .toUriString();

            TradeAvailabilityCheckRequest payload = new TradeAvailabilityCheckRequest(
                    items.stream()
                            .map(i -> new TradeItem(i.getCardId(), i.getCondition(), i.getQuantity()))
                            .toList()
            );

            // Prepara headers con il token
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            headers.set("Content-Type", "application/json");

            HttpEntity<TradeAvailabilityCheckRequest> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<TradeAvailabilityCheckResponse> response =
                    restTemplate.exchange(url, HttpMethod.POST, entity, TradeAvailabilityCheckResponse.class);

            if (response.getBody() == null || !response.getBody().isAvailable()) {
                throw new RuntimeException("L'utente non possiede tutte le carte offerte nelle quantità richieste");
            }

        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Errore durante la verifica della collezione");
        }
    }

    // Inner classes (invariate)
    public static class ListingDetails {
        private String id;
        private String cardId;
        private String sellerUsername;
        private String condition;
        private double price;
        private int quantity;
        private String status;

        public ListingDetails() {}

        public String getId() { return id; }
        public String getCardId() { return cardId; }
        public String getSellerUsername() { return sellerUsername; }
        public String getCondition() { return condition; }
        public double getPrice() { return price; }
        public int getQuantity() { return quantity; }
        public String getStatus() { return status; }

        public void setId(String id) { this.id = id; }
        public void setCardId(String cardId) { this.cardId = cardId; }
        public void setSellerUsername(String sellerUsername) { this.sellerUsername = sellerUsername; }
        public void setCondition(String condition) { this.condition = condition; }
        public void setPrice(double price) { this.price = price; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class TradeAvailabilityCheckRequest {
        private List<TradeItem> items;

        public TradeAvailabilityCheckRequest() {}

        public TradeAvailabilityCheckRequest(List<TradeItem> items) {
            this.items = items;
        }

        public List<TradeItem> getItems() { return items; }
        public void setItems(List<TradeItem> items) { this.items = items; }
    }

    public static class TradeAvailabilityCheckResponse {
        private boolean available;

        public TradeAvailabilityCheckResponse() {}

        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
    }

    public static class CompleteTradePayload {
        private String proposerUsername;
        private String recipientUsername;
        private List<TradeItem> itemsFromProposerToRecipient;
        private List<TradeItem> itemsFromRecipientToProposer;

        public CompleteTradePayload() {}

        public CompleteTradePayload(String proposerUsername,
                                    String recipientUsername,
                                    List<TradeItem> itemsFromProposerToRecipient,
                                    List<TradeItem> itemsFromRecipientToProposer) {
            this.proposerUsername = proposerUsername;
            this.recipientUsername = recipientUsername;
            this.itemsFromProposerToRecipient = itemsFromProposerToRecipient;
            this.itemsFromRecipientToProposer = itemsFromRecipientToProposer;
        }

        public String getProposerUsername() { return proposerUsername; }
        public String getRecipientUsername() { return recipientUsername; }
        public List<TradeItem> getItemsFromProposerToRecipient() { return itemsFromProposerToRecipient; }
        public List<TradeItem> getItemsFromRecipientToProposer() { return itemsFromRecipientToProposer; }

        public void setProposerUsername(String proposerUsername) { this.proposerUsername = proposerUsername; }
        public void setRecipientUsername(String recipientUsername) { this.recipientUsername = recipientUsername; }
        public void setItemsFromProposerToRecipient(List<TradeItem> itemsFromProposerToRecipient) { this.itemsFromProposerToRecipient = itemsFromProposerToRecipient; }
        public void setItemsFromRecipientToProposer(List<TradeItem> itemsFromRecipientToProposer) { this.itemsFromRecipientToProposer = itemsFromRecipientToProposer; }
    }
}
