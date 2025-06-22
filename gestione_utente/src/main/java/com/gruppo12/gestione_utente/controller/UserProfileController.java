package com.gruppo12.gestione_utente.controller;

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

    // Actualizar campo específico
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
                case "telefono": profile.setTelefono(value); break;
            }
        });

        UserProfile updatedProfile = profileRepository.save(profile);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/verify-token")
    public ResponseEntity<Void> verifyToken(@AuthenticationPrincipal String username) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/profile")
    public ResponseEntity<String> createProfile(@RequestBody UserProfileRequest profileRequest) {
        try {
            // Verificar si ya existe un perfil para este username
            UserProfile existingProfile = profileRepository.findByUsername(profileRequest.getUsername());
            if (existingProfile != null) {
                return ResponseEntity.badRequest().body("Perfil già esistente per questo username");
            }

            // Crear nuevo perfil
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

            // Guardar el perfil
            UserProfile savedProfile = profileRepository.save(newProfile);

            System.out.println("Perfil creado exitosamente para usuario: " + profileRequest.getUsername());
            return ResponseEntity.ok("Perfil creado con successo");

        } catch (Exception e) {
            System.err.println("Error al crear perfil para usuario " + profileRequest.getUsername() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore interno durante la creazione del profilo");
        }
    }

}





