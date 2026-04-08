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

    // URL del payment service — usato solo per accreditare il venditore al confirm
    private final String PAYMENT_ADD_URL = "http://payment-service:8085/api/payment/add";

    @Autowired
    private OrderRepository repo;

    @Autowired
    private RestTemplate restTemplate;

    // ── GET ORDERS BY BUYER ──
    public List<Order> getBuyerOrders(String username) {
        return repo.findByBuyerUsernameOrderByCreatedAtDesc(username);
    }

    // ── GET ORDERS BY SELLER ──
    public List<Order> getSellerOrders(String username) {
        return repo.findBySellerUsernameOrderByCreatedAtDesc(username);
    }

    /**
     * Chiamato da checkout.js DOPO che il pagamento è già stato completato.
     * Raggruppa gli item per sellerId e crea un Order per ciascun venditore.
     */
    public CheckoutResponse createOrders(CheckoutRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            return new CheckoutResponse(false, "Carrello vuoto");
        }

        // Group items by seller
        Map<String, List<CheckoutItemDTO>> grouped = req.getItems().stream()
                .collect(Collectors.groupingBy(CheckoutItemDTO::getSellerId));

        for (Map.Entry<String, List<CheckoutItemDTO>> entry : grouped.entrySet()) {
            String sellerId              = entry.getKey();
            List<CheckoutItemDTO> dtoList = entry.getValue();

            List<OrderItem> orderItems = dtoList.stream().map(dto -> {
                OrderItem oi = new OrderItem();
                oi.setCardId(dto.getCardId());
                oi.setCardName(dto.getCardName());   // snapshot nome dalla frontend (dal catalog)
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
                    req.getBuyerUsername(),
                    sellerId,
                    req.getBuyerAddress(),
                    orderItems,
                    subtotal,
                    SHIPPING,
                    subtotal + SHIPPING
            );

            repo.save(order);
        }

        return new CheckoutResponse(true, "Ordini creati con successo");
    }

    /**
     * Il compratore conferma di aver ricevuto le carte.
     * L'ordine passa a COMPLETATO e i soldi vengono accreditati al venditore.
     */
    public Order confirm(String orderId) {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Ordine non trovato: " + orderId));

        if (order.getStatus() == OrderStatus.COMPLETATO) {
            return order; // idempotente
        }

        order.setStatus(OrderStatus.COMPLETATO);
        Order saved = repo.save(order);

        // Accredita il venditore: gli mandiamo il totalprice (senza spedizione)
        creditSeller(order.getSellerUsername(), order.getTotalPrice());

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
            // Log e vai avanti — l'ordine è già confermato, il pagamento può essere ritentato
            System.err.println("Errore accredito venditore " + sellerUsername + ": " + e.getMessage());
        }
    }
}