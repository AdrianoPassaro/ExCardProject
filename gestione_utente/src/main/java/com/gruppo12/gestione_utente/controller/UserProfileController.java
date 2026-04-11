package com.gruppo12.gestione_utente.controller;

import com.gruppo12.gestione_utente.dto.SellerProfileResponse;
import com.gruppo12.gestione_utente.model.UserProfile;
import com.gruppo12.gestione_utente.repository.UserProfileRepository;
import com.gruppo12.gestione_utente.dto.AuthEmailResponse;
import org.springframework.web.client.RestTemplate;
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
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    // Aggiorna uno o più campi del profilo utente (parziale)
    @PatchMapping("/profile")
    public ResponseEntity<UserProfile> updateProfileField(
            @AuthenticationPrincipal String username,
            @RequestBody Map<String, String> updates) {

        UserProfile profile = profileRepository.findByUsername(username);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        updates.forEach((key, value) -> {
            switch (key) {
                case "nome": profile.setNome(value); break;
                case "cognome": profile.setCognome(value); break;
                case "dataNascita": profile.setDataNascita(value); break;
                case "indirizzo": profile.setIndirizzo(value); break;
                case "cap": profile.setCap(value); break;
                case "citta": profile.setCitta(value); break;
                case "provincia": profile.setProvincia(value); break;
                case "paese": profile.setPaese(value); break;
                case "paeseCode": profile.setPaeseCode(value); break;
                case "telefono": profile.setTelefono(value); break;
            }
        });

        UserProfile updatedProfile = profileRepository.save(profile);
        return ResponseEntity.ok(updatedProfile);
    }

    // Verifica la validità del token JWT
    @GetMapping("/verify-token")
    public ResponseEntity<Void> verifyToken(@AuthenticationPrincipal String username) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/public/{username}")
    public ResponseEntity<SellerProfileResponse> getPublicProfile(@PathVariable String username) {
        UserProfile profile = profileRepository.findByUsername(username);

        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        String email = null;

        try {
            RestTemplate restTemplate = new RestTemplate();

            AuthEmailResponse emailResponse = restTemplate.getForObject(
                    "http://auth-service:8080/api/auth/public/email/" + username,
                    AuthEmailResponse.class
            );

            if (emailResponse != null) {
                email = emailResponse.getEmail();
            }
        } catch (Exception e) {
            System.out.println("Impossibile recuperare email da authentication_autorization: " + e.getMessage());
        }

        SellerProfileResponse response = new SellerProfileResponse(
                profile.getUsername(),
                profile.getNome(),
                profile.getCognome(),
                profile.getAverageRating(),
                profile.getTotalSales(),
                email,
                profile.getPaese(),
                profile.getPaeseCode()
        );
        return ResponseEntity.ok(response);
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
                seller.getAverageRating(), seller.getTotalSales(), null, seller.getPaese(), seller.getPaeseCode());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/profile")
    public ResponseEntity<String> createProfile(@RequestBody UserProfileRequest profileRequest) {
        try {
            // Verifica se esiste già un profilo per questo username
            UserProfile existingProfile = profileRepository.findByUsername(profileRequest.getUsername());
            if (existingProfile != null) {
                return ResponseEntity.badRequest().body("Profilo già esistente per questo username");
            }

            // Crea un nuovo profilo
            UserProfile newProfile = new UserProfile();
            newProfile.setUsername(profileRequest.getUsername());
            newProfile.setNome(profileRequest.getNome());
            newProfile.setCognome(profileRequest.getCognome());
            newProfile.setDataNascita(profileRequest.getDataNascita());
            newProfile.setIndirizzo(profileRequest.getIndirizzo());
            newProfile.setCap(profileRequest.getCap());
            newProfile.setCitta(profileRequest.getCitta());
            newProfile.setProvincia(profileRequest.getProvincia());
            newProfile.setPaese(profileRequest.getPaese());
            newProfile.setPaeseCode(profileRequest.getPaeseCode());
            newProfile.setTelefono(profileRequest.getTelefono());

            // Salva il profilo nel database
            UserProfile savedProfile = profileRepository.save(newProfile);

            System.out.println("Profilo creato con successo per utente: " + profileRequest.getUsername());
            return ResponseEntity.ok("Profilo creato con successo");

        } catch (Exception e) {
            System.err.println("Errore nella creazione del profilo per utente " + profileRequest.getUsername() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore interno durante la creazione del profilo");
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

    @GetMapping("/seller/{username}")
    public ResponseEntity<SellerProfileResponse> getSellerProfile(@PathVariable String username) {
        try {
            UserProfile profile = profileRepository.findByUsername(username);

            // Se non hai @NoArgsConstructor, devi creare l'oggetto con parametri "dummy"
            // e poi sovrascriverli, o aggiungere il costruttore vuoto nel DTO.
            SellerProfileResponse res = new SellerProfileResponse();

            if (profile == null) {
                res.setUsername(username);
                res.setAverageRating(0.0);
                res.setTotalSales(0);
                return ResponseEntity.ok(res);
            }

            res.setUsername(profile.getUsername());
            res.setNome(profile.getNome() != null ? profile.getNome() : "");
            res.setCognome(profile.getCognome() != null ? profile.getCognome() : "");
            res.setAverageRating(profile.getAverageRating()); // double primitivo, non può essere null
            res.setTotalSales(profile.getTotalSales());       // int primitivo, non può essere null
            res.setEmail("email-protetta@esempio.com");
            res.setPaese(profile.getPaese() != null ? profile.getPaese() : "");
            res.setPaeseCode(profile.getPaeseCode() != null ? profile.getPaeseCode() : "");

            return ResponseEntity.ok(res);

        } catch (Exception e) {
            // Questo scriverà l'errore REALE nei log di Docker/IntelliJ
            System.err.println("CRASH GET_SELLER PER: " + username);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
