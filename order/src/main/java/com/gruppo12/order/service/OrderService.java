package com.gruppo12.order.service;

import com.gruppo12.order.dto.*;
import com.gruppo12.order.model.*;
import com.gruppo12.order.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final double SHIPPING = 3.0;

    private final String PAYMENT_ADD_URL  = "http://payment-service:8085/api/payment/add";
    private final String USER_RATE_URL    = "http://management-service:8081/api/user/rate/";
    private final String USER_SALES_URL = "http://management-service:8081/api/user/sales/";

    @Autowired
    private OrderRepository repo;

    @Autowired
    private RestTemplate restTemplate;

    public List<Order> getBuyerOrders(String username) {
        return repo.findByBuyerUsernameOrderByCreatedAtDesc(username);
    }

    public List<Order> getSellerOrders(String username) {
        return repo.findBySellerUsernameOrderByCreatedAtDesc(username);
    }

    public CheckoutResponse createOrders(CheckoutRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            return new CheckoutResponse(false, "Carrello vuoto");
        }

        Map<String, List<CheckoutItemDTO>> grouped = req.getItems().stream()
                .collect(Collectors.groupingBy(CheckoutItemDTO::getSellerId));

        for (Map.Entry<String, List<CheckoutItemDTO>> entry : grouped.entrySet()) {
            String sellerId               = entry.getKey();
            List<CheckoutItemDTO> dtoList = entry.getValue();

            List<OrderItem> orderItems = dtoList.stream().map(dto -> {
                OrderItem oi = new OrderItem();
                oi.setCardId(dto.getCardId());
                oi.setCardName(dto.getCardName());
                oi.setCondition(dto.getCondition());
                oi.setQuantity(dto.getQuantity() > 0 ? dto.getQuantity() : 1);
                oi.setPrice(dto.getPrice());
                oi.setSellerUsername(sellerId);
                return oi;
            }).collect(Collectors.toList());

            double subtotal = orderItems.stream()
                    .mapToDouble(i -> i.getPrice() * i.getQuantity())
                    .sum();

            Order order = new Order(
                    req.getBuyerUsername(), sellerId, req.getBuyerAddress(),
                    orderItems, subtotal, SHIPPING, subtotal + SHIPPING
            );
            repo.save(order);
        }

        return new CheckoutResponse(true, "Ordini creati con successo");
    }

    public Order confirm(String id, String token) { // Riceve il token
        Order order = repo.findById(id).orElseThrow();
        order.setStatus(OrderStatus.COMPLETATO);
        order = repo.save(order);

        // Passa il token a questo metodo
        incrementSellerSales(order.getSellerUsername(), token);

        return order;
    }

    /**
     * Salva il voto nell'ordine (per evitare duplicati) e lo invia al profilo venditore.
     * Se l'ordine ha già un buyerRating > 0, sovrascrive la vecchia recensione nel profilo
     * rimuovendo quella precedente (aggiornamento, non duplicato).
     *
     * Per semplicità: se è un aggiornamento, aggiungiamo la nuova star al profilo venditore.
     * Il controllo anti-duplicato vero è che l'ordine ha già buyerRating, quindi il frontend
     * non chiama questo endpoint per ordini già valutati a meno che l'utente usi "Modifica".
     */
    public Order rateOrder(String orderId, String buyerUsername, int stars, String token) {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Ordine non trovato"));

        if (!order.getBuyerUsername().equals(buyerUsername)) {
            throw new RuntimeException("Non autorizzato a recensire questo ordine");
        }

        order.setBuyerRating(stars);
        Order saved = repo.save(order);

        // Passiamo anche l'ID dell'ordine e il token JWT
        sendRatingToProfile(order.getSellerUsername(), orderId, stars, token);

        return saved;
    }

    private void creditSeller(String sellerUsername, double amount) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("username", sellerUsername);

            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.exchange(PAYMENT_ADD_URL, HttpMethod.POST, entity, Void.class);
        } catch (Exception e) {
            System.err.println("Errore accredito venditore " + sellerUsername + ": " + e.getMessage());
        }
    }

    private void sendRatingToProfile(String sellerUsername, String orderId, int stars, String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // Risolve l'errore 401 Unauthorized
            headers.set("Authorization", token);

            Map<String, Object> body = new HashMap<>();
            body.put("stars", stars);
            body.put("orderId", orderId);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.exchange(USER_RATE_URL + sellerUsername, HttpMethod.POST, entity, Void.class);
        } catch (Exception e) {
            System.err.println("Errore invio rating a profilo " + sellerUsername + ": " + e.getMessage());
        }
    }

    private void incrementSellerSales(String sellerUsername, String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", token); // Fondamentale!
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            restTemplate.exchange(
                    USER_SALES_URL + sellerUsername,
                    HttpMethod.POST,
                    entity,
                    Void.class
            );
        } catch (Exception e) {
            System.err.println("Errore incremento vendite: " + e.getMessage());
        }
    }
}