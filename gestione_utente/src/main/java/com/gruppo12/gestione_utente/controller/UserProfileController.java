package com.gruppo12.gestione_utente.controller;

import com.gruppo12.gestione_utente.dto.UserProfileRequest;
import com.gruppo12.gestione_utente.model.UserProfile;
import com.gruppo12.gestione_utente.repository.UserProfileRepository;
import com.gruppo12.gestione_utente.service.UserService;
import com.gruppo12.gestione_utente.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {
    private final UserService service;
    private final JwtUtil jwtUtil;
    @Value("${jwt.secret}")
    private String jwtSecret;

    public UserProfileController(UserService s, JwtUtil j) {
        this.service = s; this.jwtUtil = j;
    }

    private String extractUsername(String token){
        return Jwts.parserBuilder()
                .setSigningKey(jwtSecret.getBytes())
                .build().parseClaimsJws(token.replace("Bearer ",""))
                .getBody().getSubject();
    }

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public UserProfile getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
    }

    @PutMapping("/update")
    public UserProfile updateProfile(@RequestBody UserProfileRequest updatedProfile,
                                     @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        UserProfile existing = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
        return userService.updateUser(existing, updatedProfile);
    }

    @Autowired
    private UserProfileRepository repository;

    @PostMapping("/profile")
    public ResponseEntity<?> createProfile(@RequestBody UserProfileRequest profileRequest) {
        if (repository.findByUsername(profileRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Profilo già esistente");
        }

        UserProfile profile = new UserProfile();
        profile.setCitta(profileRequest.getCitta());
        profile.setTelefono(profileRequest.getTelefono());
        profile.setCap(profileRequest.getCap());
        profile.setIndirizzo(profileRequest.getIndirizzo());
        profile.setProvincia(profileRequest.getProvincia());
        profile.setNome(profileRequest.getNome());
        profile.setCognome(profileRequest.getCognome());
        profile.setDataNascita(profileRequest.getDataNascita());

        repository.save(profile);
        return ResponseEntity.ok().build();
    }
}





