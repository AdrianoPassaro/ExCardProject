package com.gruppo12.cards_catalog;

import com.gruppo12.cards_catalog.model.CardDocument;
import com.gruppo12.cards_catalog.repository.CardRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final CardRepository cardRepository;

    public DataLoader(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        // Se il DB ha già carte, non fare nulla
        if (cardRepository.count() > 0) {
            System.out.println(">> Catalogo già popolato, skip DataLoader.");
            return;
        }

        List<CardDocument> cards = new ArrayList<>();

        cards.add(new CardDocument("Charizard",  "Base Set", "4",  "Rare Holo", "https://images.pokemontcg.io/base1/4.png"));
        cards.add(new CardDocument("Blastoise",  "Base Set", "2",  "Rare Holo", "https://images.pokemontcg.io/base1/2.png"));
        cards.add(new CardDocument("Venusaur",   "Base Set", "15", "Rare Holo", "https://images.pokemontcg.io/base1/15.png"));
        cards.add(new CardDocument("Pikachu",    "Base Set", "58", "Common",    "https://images.pokemontcg.io/base1/58.png"));
        cards.add(new CardDocument("Mewtwo",     "Base Set", "10", "Rare Holo", "https://images.pokemontcg.io/base1/10.png"));
        cards.add(new CardDocument("Gyarados",   "Base Set", "6",  "Rare Holo", "https://images.pokemontcg.io/base1/6.png"));
        cards.add(new CardDocument("Alakazam",   "Base Set", "1",  "Rare Holo", "https://images.pokemontcg.io/base1/1.png"));
        cards.add(new CardDocument("Raichu",     "Base Set", "14", "Rare Holo", "https://images.pokemontcg.io/base1/14.png"));
        cards.add(new CardDocument("Machamp",    "Base Set", "8",  "Rare Holo", "https://images.pokemontcg.io/base1/8.png"));
        cards.add(new CardDocument("Clefairy",   "Base Set", "5",  "Rare Holo", "https://images.pokemontcg.io/base1/5.png"));

        cardRepository.saveAll(cards);

        System.out.println(">> DataLoader: inserite " + cards.size() + " carte nel catalogo.");
    }
}