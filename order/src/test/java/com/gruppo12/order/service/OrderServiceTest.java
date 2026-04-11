package com.gruppo12.order.service;

import com.gruppo12.order.dto.CheckoutItemDTO;
import com.gruppo12.order.dto.CheckoutRequest;
import com.gruppo12.order.dto.CheckoutResponse;
import com.gruppo12.order.model.Order;
import com.gruppo12.order.model.OrderItem;
import com.gruppo12.order.model.OrderStatus;
import com.gruppo12.order.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit test per OrderService.
 *
 * ─── COME FUNZIONANO ────────────────────────────────────────────────────────
 * @ExtendWith(MockitoExtension.class)
 *   Dice a JUnit di usare Mockito per creare automaticamente i mock.
 *
 * @Mock
 *   Crea un oggetto "finto" di OrderRepository e RestTemplate.
 *   I mock non vanno a toccare il database reale né fanno chiamate HTTP.
 *   Puoi programmarli per restituire quello che vuoi con `when(...).thenReturn(...)`.
 *
 * @InjectMocks
 *   Crea l'istanza REALE di OrderService e inietta i mock al posto delle
 *   dipendenze (@Autowired). In questo modo testi solo la logica del service,
 *   senza database né rete.
 *
 * ─── COME ESEGUIRE ──────────────────────────────────────────────────────────
 * Da terminale nella cartella del microservizio:
 *   mvn test
 *
 * Per eseguire solo questa classe:
 *   mvn test -Dtest=OrderServiceTest
 *
 * Per vedere i risultati:
 *   - Nel terminale: JUnit stampa PASSED/FAILED per ogni metodo
 *   - In target/surefire-reports/: file XML e TXT con dettaglio
 *   - Se usi IntelliJ/Eclipse: click destro sul file → Run
 *
 * ─── DIPENDENZE NECESSARIE nel pom.xml ──────────────────────────────────────
 * Spring Boot Test è già incluso con spring-boot-starter-test.
 * Assicurati di avere nel pom.xml:
 *
 *   <dependency>
 *     <groupId>org.springframework.boot</groupId>
 *     <artifactId>spring-boot-starter-test</artifactId>
 *     <scope>test</scope>
 *   </dependency>
 *
 * Questo include JUnit 5, Mockito e AssertJ automaticamente.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository repo;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private OrderService service;

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────────────────────────────────────

    /** Crea un CheckoutItemDTO di test */
    private CheckoutItemDTO makeItem(String listingId, String cardId,
                                     String sellerId, double price, int qty) {
        CheckoutItemDTO dto = new CheckoutItemDTO();
        dto.setListingId(listingId);
        dto.setCardId(cardId);
        dto.setCardName("Carta " + cardId);
        dto.setSellerId(sellerId);
        dto.setCondition("Near Mint");
        dto.setPrice(price);
        dto.setQuantity(qty);
        return dto;
    }

    /** Crea un Order già salvato con id */
    private Order makeOrder(String id, String buyer, String seller,
                            OrderStatus status, double totalPrice) {
        Order o = new Order(buyer, seller, "Via Roma 1 · 00100 Roma (RM)",
                new ArrayList<>(), totalPrice, 3.0, totalPrice + 3.0);
        // Simula il campo @Id assegnato da MongoDB
        try {
            var idField = o.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(o, id);
        } catch (Exception e) { throw new RuntimeException(e); }
        o.setStatus(status);
        return o;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST: createOrders
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createOrders: carrello vuoto → risposta fallimento")
    void createOrders_emptyCart_returnsFailure() {
        CheckoutRequest req = new CheckoutRequest();
        req.setBuyerUsername("mario");
        req.setBuyerAddress("Via Roma 1");
        req.setItems(new ArrayList<>());

        CheckoutResponse resp = service.createOrders(req);

        assertThat(resp.isSuccess()).isFalse();
        assertThat(resp.getMessage()).containsIgnoringCase("vuoto");
        // Il repository non deve essere chiamato
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("createOrders: carrello null → risposta fallimento")
    void createOrders_nullItems_returnsFailure() {
        CheckoutRequest req = new CheckoutRequest();
        req.setBuyerUsername("mario");
        req.setItems(null);

        CheckoutResponse resp = service.createOrders(req);

        assertThat(resp.isSuccess()).isFalse();
    }

    @Test
    @DisplayName("createOrders: item singolo → crea un ordine con dati corretti")
    void createOrders_singleItem_createsOneOrder() {
        CheckoutRequest req = new CheckoutRequest();
        req.setBuyerUsername("mario");
        req.setBuyerAddress("Via Roma 1 · 00100 Roma (RM)");
        req.setItems(List.of(makeItem("lst1", "card1", "luigi", 10.0, 2)));

        when(repo.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        CheckoutResponse resp = service.createOrders(req);

        assertThat(resp.isSuccess()).isTrue();

        // Verifica che sia stato salvato esattamente 1 ordine
        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(repo, times(1)).save(captor.capture());

        Order saved = captor.getValue();
        assertThat(saved.getBuyerUsername()).isEqualTo("mario");
        assertThat(saved.getSellerUsername()).isEqualTo("luigi");
        assertThat(saved.getStatus()).isEqualTo(OrderStatus.IN_ATTESA);
        assertThat(saved.getShippingCost()).isEqualTo(3.0);
        // totalPrice = 10.0 * 2 = 20.0
        assertThat(saved.getTotalPrice()).isEqualTo(20.0);
        assertThat(saved.getFinalPrice()).isEqualTo(23.0);
        assertThat(saved.getBuyerRating()).isEqualTo(0);  // nessuna recensione inizialmente
    }

    @Test
    @DisplayName("createOrders: due item stesso venditore → crea UN solo ordine")
    void createOrders_twoItemsSameSeller_createsOneOrder() {
        CheckoutRequest req = new CheckoutRequest();
        req.setBuyerUsername("mario");
        req.setBuyerAddress("Via Roma 1");
        req.setItems(List.of(
                makeItem("lst1", "card1", "luigi", 5.0, 1),
                makeItem("lst2", "card2", "luigi", 8.0, 1)
        ));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.createOrders(req);

        verify(repo, times(1)).save(any());
    }

    @Test
    @DisplayName("createOrders: item di due venditori diversi → crea DUE ordini")
    void createOrders_twoSellers_createsTwoOrders() {
        CheckoutRequest req = new CheckoutRequest();
        req.setBuyerUsername("mario");
        req.setBuyerAddress("Via Roma 1");
        req.setItems(List.of(
                makeItem("lst1", "card1", "luigi", 10.0, 1),
                makeItem("lst2", "card2", "peach", 15.0, 1)
        ));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CheckoutResponse resp = service.createOrders(req);

        assertThat(resp.isSuccess()).isTrue();
        verify(repo, times(2)).save(any());
    }

    @Test
    @DisplayName("createOrders: totalPrice calcolato correttamente su più quantity")
    void createOrders_multipleQuantity_totalPriceCorrect() {
        CheckoutRequest req = new CheckoutRequest();
        req.setBuyerUsername("mario");
        req.setBuyerAddress("Via Roma 1");
        // 3 carte a 4€ ciascuna = 12€ totale articoli
        req.setItems(List.of(makeItem("lst1", "card1", "luigi", 4.0, 3)));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.createOrders(req);

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(repo).save(captor.capture());
        assertThat(captor.getValue().getTotalPrice()).isEqualTo(12.0);
        assertThat(captor.getValue().getFinalPrice()).isEqualTo(15.0); // 12 + 3 spedizione
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST: confirm
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("confirm: ordine IN_ATTESA → diventa COMPLETATO")
    void confirm_pendingOrder_becomesCompleted() {
        Order order = makeOrder("ord1", "mario", "luigi", OrderStatus.IN_ATTESA, 20.0);
        when(repo.findById("ord1")).thenReturn(Optional.of(order));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // CORREZIONE: Aggiungi "dummy-token"
        Order result = service.confirm("ord1", "dummy-token");

        assertThat(result.getStatus()).isEqualTo(OrderStatus.COMPLETATO);
        verify(repo).save(argThat(o -> o.getStatus() == OrderStatus.COMPLETATO));
    }

    @Test
    @DisplayName("confirm: ordine già COMPLETATO → idempotente, non ri-salva")
    void confirm_alreadyCompleted_idempotent() {
        Order order = makeOrder("ord1", "mario", "luigi", OrderStatus.COMPLETATO, 20.0);
        when(repo.findById("ord1")).thenReturn(Optional.of(order));

        // CORREZIONE: Aggiungi "dummy-token"
        Order result = service.confirm("ord1", "dummy-token");

        assertThat(result.getStatus()).isEqualTo(OrderStatus.COMPLETATO);
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("confirm: ordine non trovato → lancia eccezione")
    void confirm_orderNotFound_throwsException() {
        when(repo.findById("nonexistent")).thenReturn(Optional.empty());

        // CORREZIONE: Aggiungi "dummy-token"
        assertThatThrownBy(() -> service.confirm("nonexistent", "dummy-token"))
                .isInstanceOf(RuntimeException.class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST: rateOrder
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("rateOrder: voto valido su ordine completato → salva buyerRating")
    void rateOrder_validRating_savesBuyerRating() {
        Order order = makeOrder("ord1", "mario", "luigi", OrderStatus.COMPLETATO, 20.0);
        when(repo.findById("ord1")).thenReturn(Optional.of(order));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // AGGIUNTO: "mock-token" come 4° parametro
        Order result = service.rateOrder("ord1", "mario", 4, "mock-token");

        assertThat(result.getBuyerRating()).isEqualTo(4);
        verify(repo).save(argThat(o -> o.getBuyerRating() == 4));
    }

    @Test
    @DisplayName("rateOrder: utente diverso dal compratore → lancia eccezione")
    void rateOrder_wrongUser_throwsException() {
        Order order = makeOrder("ord1", "mario", "luigi", OrderStatus.COMPLETATO, 20.0);
        when(repo.findById("ord1")).thenReturn(Optional.of(order));

        // AGGIUNTO: "mock-token"
        assertThatThrownBy(() -> service.rateOrder("ord1", "peach", 5, "mock-token"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("autorizzato");
    }

    @Test
    @DisplayName("rateOrder: ordine non completato → lancia eccezione")
    void rateOrder_orderNotCompleted_throwsException() {
        Order order = makeOrder("ord1", "mario", "luigi", OrderStatus.IN_ATTESA, 20.0);
        when(repo.findById("ord1")).thenReturn(Optional.of(order));

        // AGGIUNTO: "mock-token"
        assertThatThrownBy(() -> service.rateOrder("ord1", "mario", 5, "mock-token"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("completati");
    }

    @Test
    @DisplayName("rateOrder: voto 0 → non valido, lancia eccezione")
    void rateOrder_zeroStars_throwsException() {
        Order order = makeOrder("ord1", "mario", "luigi", OrderStatus.COMPLETATO, 20.0);
        when(repo.findById("ord1")).thenReturn(Optional.of(order));

        // AGGIUNTO: "mock-token"
        assertThatThrownBy(() -> service.rateOrder("ord1", "mario", 0, "mock-token"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("valido");
    }

    @Test
    @DisplayName("rateOrder: voto 6 → non valido, lancia eccezione")
    void rateOrder_sixStars_throwsException() {
        Order order = makeOrder("ord1", "mario", "luigi", OrderStatus.COMPLETATO, 20.0);
        when(repo.findById("ord1")).thenReturn(Optional.of(order));

        // AGGIUNTO: "mock-token"
        assertThatThrownBy(() -> service.rateOrder("ord1", "mario", 6, "mock-token"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("valido");
    }

    @Test
    @DisplayName("rateOrder: modifica recensione → sovrascrive il voto precedente")
    void rateOrder_updateExisting_overwritesRating() {
        Order order = makeOrder("ord1", "mario", "luigi", OrderStatus.COMPLETATO, 20.0);
        order.setBuyerRating(3);  // aveva già un voto
        when(repo.findById("ord1")).thenReturn(Optional.of(order));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // AGGIUNTO: "mock-token"
        Order result = service.rateOrder("ord1", "mario", 5, "mock-token");

        assertThat(result.getBuyerRating()).isEqualTo(5);
    }

    @Test
    @DisplayName("rateOrder: voto ai limiti (1 e 5) → entrambi validi")
    void rateOrder_boundaryValues_bothValid() {
        Order order1 = makeOrder("ord1", "mario", "luigi", OrderStatus.COMPLETATO, 20.0);
        Order order2 = makeOrder("ord2", "mario", "luigi", OrderStatus.COMPLETATO, 20.0);
        when(repo.findById("ord1")).thenReturn(Optional.of(order1));
        when(repo.findById("ord2")).thenReturn(Optional.of(order2));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // AGGIUNTO: "mock-token" in entrambe le chiamate
        assertThatNoException().isThrownBy(() -> service.rateOrder("ord1", "mario", 1, "mock-token"));
        assertThatNoException().isThrownBy(() -> service.rateOrder("ord2", "mario", 5, "mock-token"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST: getBuyerOrders / getSellerOrders
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getBuyerOrders: restituisce gli ordini del compratore")
    void getBuyerOrders_returnsCorrectOrders() {
        List<Order> expected = List.of(
                makeOrder("ord1", "mario", "luigi", OrderStatus.IN_ATTESA, 10.0),
                makeOrder("ord2", "mario", "peach", OrderStatus.COMPLETATO, 20.0)
        );
        when(repo.findByBuyerUsernameOrderByCreatedAtDesc("mario")).thenReturn(expected);

        List<Order> result = service.getBuyerOrders("mario");

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(o -> o.getBuyerUsername().equals("mario"));
    }

    @Test
    @DisplayName("getSellerOrders: restituisce gli ordini del venditore")
    void getSellerOrders_returnsCorrectOrders() {
        List<Order> expected = List.of(
                makeOrder("ord1", "mario", "luigi", OrderStatus.IN_ATTESA, 10.0)
        );
        when(repo.findBySellerUsernameOrderByCreatedAtDesc("luigi")).thenReturn(expected);

        List<Order> result = service.getSellerOrders("luigi");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSellerUsername()).isEqualTo("luigi");
    }

    @Test
    @DisplayName("getBuyerOrders: utente senza ordini → lista vuota")
    void getBuyerOrders_noOrders_returnsEmptyList() {
        when(repo.findByBuyerUsernameOrderByCreatedAtDesc("newuser")).thenReturn(List.of());

        List<Order> result = service.getBuyerOrders("newuser");

        assertThat(result).isEmpty();
    }
}
