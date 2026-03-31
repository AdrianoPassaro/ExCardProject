package com.gruppo12.order.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

import com.gruppo12.order.model.*;
import com.gruppo12.order.repository.OrderRepository;
import com.gruppo12.order.dto.*;

@Service
public class OrderService {

    private static final double SHIPPING = 5.0;

    @Autowired
    private OrderRepository repo;

    @Autowired
    private RestTemplate restTemplate;

    private final String CART_URL = "http://cart-service:8082/api/cart";
    private final String PAYMENT_URL = "http://payment-service:8084/api/payment/pay";

    // 🔥 PRENDE CARRELLO DA CART-SERVICE
    public List<CartItemDTO> getCart(String username) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("username", username);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<CartResponse> response =
                restTemplate.exchange(
                        CART_URL,
                        HttpMethod.GET,
                        entity,
                        CartResponse.class
                );

        return response.getBody().getItems();
    }

    // 🔥 SVUOTA CARRELLO
    public void clearCart(String username) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("username", username);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        restTemplate.exchange(
                CART_URL + "/clear",
                HttpMethod.DELETE,
                entity,
                Void.class
        );
    }

    public List<Order> getOrders(String username) {

        List<Order> buyer = repo.findByBuyerUsername(username);
        List<Order> seller = repo.findBySellerUsername(username);

        List<Order> all = new ArrayList<>();
        all.addAll(buyer);
        all.addAll(seller);

        return all;
    }

    public CheckoutResponse checkout(String username) {

        // 🔥 PRENDI CARRELLO VERO
        List<CartItemDTO> cart = getCart(username);

        if (cart.isEmpty()) {
            return new CheckoutResponse(false, "Carrello vuoto");
        }

        Map<String, List<CartItemDTO>> grouped =
                cart.stream().collect(Collectors.groupingBy(CartItemDTO::getSellerUsername));

        double total = 0;

        for (List<CartItemDTO> items : grouped.values()) {
            double t = items.stream().mapToDouble(CartItemDTO::getPrice).sum();
            total += t + SHIPPING;
        }

        // 🔥 PAGAMENTO
        PaymentRequest req = new PaymentRequest(username, total);
        Boolean ok = restTemplate.postForObject(PAYMENT_URL, req, Boolean.class);

        if (ok == null || !ok) {
            return new CheckoutResponse(false, "Saldo insufficiente");
        }

        // 🔥 CREA ORDINI
        for (String seller : grouped.keySet()) {

            List<CartItemDTO> itemsDTO = grouped.get(seller);

            List<OrderItem> items = itemsDTO.stream().map(dto -> {
                OrderItem i = new OrderItem();
                i.setCardId(dto.getCardId());
                i.setSellerUsername(dto.getSellerUsername());
                i.setPrice(dto.getPrice());
                return i;
            }).toList();

            double t = items.stream().mapToDouble(OrderItem::getPrice).sum();

            Order o = new Order();
            o.setBuyerUsername(username);
            o.setSellerUsername(seller);
            o.setItems(items);
            o.setTotalPrice(t);
            o.setShippingCost(SHIPPING);
            o.setFinalPrice(t + SHIPPING);
            o.setStatus(OrderStatus.IN_SPEDIZIONE);

            repo.save(o);
        }

        // 🔥 SVUOTA CARRELLO DOPO SUCCESSO
        clearCart(username);

        return new CheckoutResponse(true, "Ordini creati");
    }

    public Order confirm(String id) {
        Order o = repo.findById(id).orElseThrow();
        o.setStatus(OrderStatus.COMPLETATO);
        return repo.save(o);
    }
}