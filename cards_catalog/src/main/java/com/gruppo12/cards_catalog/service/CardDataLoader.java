package com.gruppo12.cards.service;

import com.gruppo12.cards_catalog.model.CardDocument;
import com.gruppo12.cards_catalog.repository.CardRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class CardDataLoader implements CommandLineRunner {

    private final CardRepository repository;

    public CardDataLoader(CardRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Controlla se il DB è già popolato
        if (repository.count() == 0) {
            List<CardDocument> cards = List.of(
                    new CardDocument("Charizard", "Base Set", "4", "Rare Holo", "https://images.pokemontcg.io/base1/4.png"),
                    new CardDocument("Blastoise", "Base Set", "2", "Rare Holo", "https://images.pokemontcg.io/base1/2.png")
                    // aggiungi altre carte qui
            );

            repository.saveAll(cards);
            System.out.println("Database delle carte popolato!");
        }
    }
}
