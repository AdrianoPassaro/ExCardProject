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
        cards.add(new CardDocument("Chansey",    "Base Set", "3",  "Rare Holo", "https://images.pokemontcg.io/base1/3.png"));
        cards.add(new CardDocument("Hitmonchan", "Base Set", "7", "Rare Holo", "https://images.pokemontcg.io/base1/7.png"));
        cards.add(new CardDocument("Magneton", "Base Set", "9", "Rare Holo", "https://images.pokemontcg.io/base1/9.png"));
        cards.add(new CardDocument("Nidoking", "Base Set", "11", "Rare Holo", "https://images.pokemontcg.io/base1/11.png"));
        cards.add(new CardDocument("Ninetales", "Base Set", "12", "Rare Holo", "https://images.pokemontcg.io/base1/12.png"));
        cards.add(new CardDocument("Poliwrath", "Base Set", "13", "Rare Holo", "https://images.pokemontcg.io/base1/13.png"));
        cards.add(new CardDocument("Zapdos", "Base Set", "16", "Rare Holo", "https://images.pokemontcg.io/base1/16.png"));
        cards.add(new CardDocument("Beedrill", "Base Set", "17", "Rare", "https://images.pokemontcg.io/base1/17.png"));
        cards.add(new CardDocument("Dragonair", "Base Set", "18", "Rare", "https://images.pokemontcg.io/base1/18.png"));
        cards.add(new CardDocument("Dugtrio", "Base Set", "19", "Rare", "https://images.pokemontcg.io/base1/19.png"));
        cards.add(new CardDocument("Electabuzz", "Base Set", "20", "Rare", "https://images.pokemontcg.io/base1/20.png"));

// Jungle
        cards.add(new CardDocument("Clefable", "Jungle", "1", "Rare Holo", "https://images.pokemontcg.io/base2/1.png"));
        cards.add(new CardDocument("Flareon", "Jungle", "3", "Rare Holo", "https://images.pokemontcg.io/base2/3.png"));
        cards.add(new CardDocument("Jolteon", "Jungle", "4", "Rare Holo", "https://images.pokemontcg.io/base2/4.png"));
        cards.add(new CardDocument("Pinsir", "Jungle", "9", "Rare Holo", "https://images.pokemontcg.io/base2/9.png"));
        cards.add(new CardDocument("Scyther", "Jungle", "10", "Rare Holo", "https://images.pokemontcg.io/base2/10.png"));
        cards.add(new CardDocument("Snorlax", "Jungle", "11", "Rare Holo", "https://images.pokemontcg.io/base2/11.png"));
        cards.add(new CardDocument("Vaporeon", "Jungle", "12", "Rare Holo", "https://images.pokemontcg.io/base2/12.png"));
        cards.add(new CardDocument("Venomoth", "Jungle", "13", "Rare Holo", "https://images.pokemontcg.io/base2/13.png"));
        cards.add(new CardDocument("Victreebel", "Jungle", "14", "Rare Holo", "https://images.pokemontcg.io/base2/14.png"));
        cards.add(new CardDocument("Pikachu", "Jungle", "60", "Common", "https://images.pokemontcg.io/base2/60.png"));

// Team Rocket
        cards.add(new CardDocument("Dark Alakazam", "Team Rocket", "1", "Rare Holo", "https://images.pokemontcg.io/base5/1.png"));
        cards.add(new CardDocument("Dark Blastoise", "Team Rocket", "3", "Rare Holo", "https://images.pokemontcg.io/base5/3.png"));
        cards.add(new CardDocument("Dark Charizard", "Team Rocket", "4", "Rare Holo", "https://images.pokemontcg.io/base5/4.png"));
        cards.add(new CardDocument("Dark Dragonite", "Team Rocket", "5", "Rare Holo", "https://images.pokemontcg.io/base5/5.png"));
        cards.add(new CardDocument("Dark Dugtrio", "Team Rocket", "6", "Rare Holo", "https://images.pokemontcg.io/base5/6.png"));
        cards.add(new CardDocument("Dark Gyarados", "Team Rocket", "8", "Rare Holo", "https://images.pokemontcg.io/base5/8.png"));
        cards.add(new CardDocument("Dark Machamp", "Team Rocket", "10", "Rare Holo", "https://images.pokemontcg.io/base5/10.png"));
        cards.add(new CardDocument("Dark Magneton", "Team Rocket", "11", "Rare Holo", "https://images.pokemontcg.io/base5/11.png"));
        cards.add(new CardDocument("Dark Raichu", "Team Rocket", "83", "Rare Holo", "https://images.pokemontcg.io/base5/83.png"));
        cards.add(new CardDocument("Dark Dragonair", "Team Rocket", "33", "Uncommon", "https://images.pokemontcg.io/base5/33.png"));

// Pokémon GO & Modern
        cards.add(new CardDocument("Venusaur", "Pokémon GO", "3", "Rare Holo", "https://images.pokemontcg.io/pgo/3.png"));
        cards.add(new CardDocument("Charizard", "Pokémon GO", "10", "Rare Holo", "https://images.pokemontcg.io/pgo/10.png"));
        cards.add(new CardDocument("Blastoise", "Pokémon GO", "17", "Rare Holo", "https://images.pokemontcg.io/pgo/17.png"));
        cards.add(new CardDocument("Gyarados", "Pokémon GO", "20", "Rare Holo", "https://images.pokemontcg.io/pgo/20.png"));
        cards.add(new CardDocument("Pikachu", "Pokémon GO", "27", "Common", "https://images.pokemontcg.io/pgo/27.png"));
        cards.add(new CardDocument("Raichu", "Pokémon GO", "28", "Rare Holo", "https://images.pokemontcg.io/pgo/28.png"));
        cards.add(new CardDocument("Mewtwo V", "Pokémon GO", "30", "Ultra Rare", "https://images.pokemontcg.io/pgo/30.png"));
        cards.add(new CardDocument("Alakazam V", "Vivid Voltage", "172", "Full Art", "https://images.pokemontcg.io/swsh4/172.png"));
        cards.add(new CardDocument("Machamp V", "Astral Radiance", "73", "Ultra Rare", "https://images.pokemontcg.io/swsh10/73.png"));
        cards.add(new CardDocument("Clefairy", "Lost Origin", "62", "Common", "https://images.pokemontcg.io/swsh11/62.png"));

// EX Isola dei Draghi (Delta Species)
        cards.add(new CardDocument("Ampharos δ Delta Species", "EX Isola dei Draghi", "1", "Rare Holo", "https://images.pokemontcg.io/ex15/1.png"));
        cards.add(new CardDocument("Feraligatr δ Delta Species", "EX Isola dei Draghi", "2", "Rare Holo", "https://images.pokemontcg.io/ex15/2.png"));
        cards.add(new CardDocument("Heracross δ Delta Species", "EX Isola dei Draghi", "3", "Rare Holo", "https://images.pokemontcg.io/ex15/3.png"));
        cards.add(new CardDocument("Nidoking δ Delta Species", "EX Isola dei Draghi", "6", "Rare Holo", "https://images.pokemontcg.io/ex15/6.png"));
        cards.add(new CardDocument("Nidoqueen δ Delta Species", "EX Isola dei Draghi", "7", "Rare Holo", "https://images.pokemontcg.io/ex15/7.png"));
        cards.add(new CardDocument("Gardevoir δ Delta Species", "EX Isola dei Draghi", "9", "Rare Holo", "https://images.pokemontcg.io/ex15/9.png"));
        cards.add(new CardDocument("Totodile δ Delta Species", "EX Isola dei Draghi", "67", "Common", "https://images.pokemontcg.io/ex15/67.png"));
        cards.add(new CardDocument("Dragonite δ Delta Species", "EX Isola dei Draghi", "91", "Rare Holo", "https://images.pokemontcg.io/ex15/91.png"));
        cards.add(new CardDocument("Charizard Gold Star δ Delta Species", "EX Isola dei Draghi", "100", "Rare Holo", "https://images.pokemontcg.io/ex15/100.png"));
        cards.add(new CardDocument("Mew Gold Star δ Delta Species", "EX Isola dei Draghi", "101", "Rare Holo", "https://images.pokemontcg.io/ex15/101.png"));

// Full Art / Alternative Art / Art Rare
        cards.add(new CardDocument("Umbreon V Alternative Art", "Evoluzioni Eteree", "189", "Ultra Rare", "https://images.pokemontcg.io/swsh7/189.png"));
        cards.add(new CardDocument("Drowzee Art Rare", "Scarlatto e Violetto", "210", "Illustration Rare", "https://images.pokemontcg.io/sv1/210.png"));
        cards.add(new CardDocument("Gengar VMAX Alternative Art", "Colpo Fusione", "271", "Rare Holo VMAX", "https://images.pokemontcg.io/swsh8/271.png"));
        cards.add(new CardDocument("Rayquaza VMAX Alternative Art", "Evoluzioni Eteree", "218", "Rare Holo VMAX", "https://images.pokemontcg.io/swsh7/218.png"));
        cards.add(new CardDocument("Giratina V Alternative Art", "Origine Perduta", "186", "Ultra Rare", "https://images.pokemontcg.io/swsh11/186.png"));
        cards.add(new CardDocument("Magikarp Art Rare", "Evoluzioni a Paldea", "203", "Illustration Rare", "https://images.pokemontcg.io/sv2/203.png"));
        cards.add(new CardDocument("Arceus V Full Art", "Astri Lucenti", "166", "Ultra Rare", "https://images.pokemontcg.io/swsh9/166.png"));
        cards.add(new CardDocument("Dialga Originale V Full Art", "Lucentezza Siderale", "177", "Ultra Rare", "https://images.pokemontcg.io/swsh10/177.png"));
        cards.add(new CardDocument("Palkia Originale V Full Art", "Lucentezza Siderale", "167", "Ultra Rare", "https://images.pokemontcg.io/swsh10/167.png"));
        cards.add(new CardDocument("Charizard ex Alternative Art", "Ossidiana Infuocata", "223", "Special Illustration Rare", "https://images.pokemontcg.io/sv3/223.png"));
        cards.add(new CardDocument("Pikachu V Full Art", "Astri Lucenti", "157", "Ultra Rare", "https://images.pokemontcg.io/swsh9/157.png"));
        cards.add(new CardDocument("Tyranitar V Alternative Art", "Stili di Lotta", "155", "Ultra Rare", "https://images.pokemontcg.io/swsh5/155.png"));

        List<CardDocument> cardsToInsert = new ArrayList<>();

        for (CardDocument card : cards) {
            boolean exists = cardRepository.existsByNameAndSetNameAndNumber(
                    card.getName(),
                    card.getSetName(),
                    card.getNumber()
            );

            if (!exists) {
                cardsToInsert.add(card);
            }
        }

        if (!cardsToInsert.isEmpty()) {
            cardRepository.saveAll(cardsToInsert);
            System.out.println(">> DataLoader: inserite " + cardsToInsert.size() + " nuove carte nel catalogo.");
        } else {
            System.out.println(">> DataLoader: tutte le carte sono già presenti, nessun inserimento.");
        }
    }
}