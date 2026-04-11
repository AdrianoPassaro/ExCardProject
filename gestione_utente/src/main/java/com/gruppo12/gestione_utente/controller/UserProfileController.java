package com.gruppo12.gestione_utente.controller;

import com.gruppo12.gestione_utente.dto.SellerProfileResponse;
import com.gruppo12.gestione_utente.model.UserProfile;
import com.gruppo12.gestione_utente.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.gruppo12.gestione_utente.dto.UserProfileRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserProfileController {

    @Autowired
    private UserProfileRepository profileRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfile> getProfile(@AuthenticationPrincipal String username) {
        UserProfile profile = profileRepository.findByUsername(username);
        if (profile == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(profile);
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfile> updateProfileField(
            @AuthenticationPrincipal String username,
            @RequestBody Map<String, String> updates) {
        UserProfile profile = profileRepository.findByUsername(username);
        if (profile == null) return ResponseEntity.notFound().build();

        updates.forEach((key, value) -> {
            switch (key) {
                case "nome":        profile.setNome(value); break;
                case "cognome":     profile.setCognome(value); break;
                case "dataNascita": profile.setDataNascita(value); break;
                case "indirizzo":   profile.setIndirizzo(value); break;
                case "cap":         profile.setCap(value); break;
                case "citta":       profile.setCitta(value); break;
                case "provincia":   profile.setProvincia(value); break;
                case "telefono":    profile.setTelefono(value); break;
            }
        });
        return ResponseEntity.ok(profileRepository.save(profile));
    }

    @GetMapping("/verify-token")
    public ResponseEntity<Void> verifyToken(@AuthenticationPrincipal String username) {
        return ResponseEntity.ok().build();
    }

    // ── PUBLIC PROFILE (usato da card-page.js per mostrare stelle venditore) ──
    @GetMapping("/public/{username}")
    public ResponseEntity<SellerProfileResponse> getPublicProfile(@PathVariable String username) {
        UserProfile profile = profileRepository.findByUsername(username);
        if (profile == null) return ResponseEntity.notFound().build();

        SellerProfileResponse resp = new SellerProfileResponse(
                profile.getUsername(),
                profile.getNome(),
                profile.getCognome(),
                profile.getAverageRating(),
                profile.getRatingCount(),
                profile.getTotalSales()
        );
        return ResponseEntity.ok(resp);
    }

    /**
     * Aggiunge una recensione (1–5 stelle) al venditore.
     * Chiamato da orders.js dopo che il compratore conferma la ricezione.
     * Body: { "stars": 4 }
     * Autenticazione richiesta (solo il compratore può valutare, controllo lato logica business).
     */
    @PostMapping("/rate/{sellerUsername}")
    public ResponseEntity<SellerProfileResponse> rateSeller(
            @PathVariable String sellerUsername,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal String reviewerUsername) {

        // Recuperiamo i dati dal body
        String orderId = (String) body.get("orderId");
        Integer stars = (Integer) body.get("stars");

        if (orderId == null || stars == null) {
            return ResponseEntity.badRequest().build();
        }

        UserProfile seller = profileRepository.findByUsername(sellerUsername);
        if (seller == null) return ResponseEntity.notFound().build();

        // Aggiorna o aggiunge il rating usando l'orderId come chiave
        seller.addOrUpdateRating(orderId, stars);
        profileRepository.save(seller);

        SellerProfileResponse resp = new SellerProfileResponse(
                seller.getUsername(), seller.getNome(), seller.getCognome(),
                seller.getAverageRating(), seller.getRatingCount(), 0);

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/profile")
    public ResponseEntity<String> createProfile(@RequestBody UserProfileRequest profileRequest) {
        try {
            UserProfile existing = profileRepository.findByUsername(profileRequest.getUsername());
            if (existing != null) return ResponseEntity.badRequest().body("Profilo già esistente");

            UserProfile newProfile = new UserProfile();
            newProfile.setUsername(profileRequest.getUsername());
            newProfile.setNome(profileRequest.getNome());
            newProfile.setCognome(profileRequest.getCognome());
            newProfile.setDataNascita(profileRequest.getDataNascita());
            newProfile.setIndirizzo(profileRequest.getIndirizzo());
            newProfile.setCap(profileRequest.getCap());
            newProfile.setCitta(profileRequest.getCitta());
            newProfile.setProvincia(profileRequest.getProvincia());
            newProfile.setTelefono(profileRequest.getTelefono());

            profileRepository.save(newProfile);
            return ResponseEntity.ok("Profilo creato con successo");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore interno: " + e.getMessage());
        }
    }

    @PostMapping("/sales/{username}")
    public ResponseEntity<Void> incrementSales(@PathVariable String username) {
        UserProfile seller = profileRepository.findByUsername(username);
        if (seller == null) return ResponseEntity.notFound().build();

        seller.incrementSales();
        profileRepository.save(seller);

        return ResponseEntity.ok().build();
    }
}