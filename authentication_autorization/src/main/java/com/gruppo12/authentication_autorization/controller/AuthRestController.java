package com.gruppo12.authentication_autorization.controller;

import com.gruppo12.authentication_autorization.dto.UserProfileRequest;
import com.gruppo12.authentication_autorization.dto.UserRegistrationRequest;
import com.gruppo12.authentication_autorization.model.User;
import com.gruppo12.authentication_autorization.repository.UserRepository;
import com.gruppo12.authentication_autorization.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
public class AuthRestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Per form HTML (application/x-www-form-urlencoded)
    @PostMapping("/register")
    public RedirectView registerForm(User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return new RedirectView("/register.html?error=exists");
        }
        userRepository.save(user);
        return new RedirectView("/login.html?success=1");
    }

    // Per form HTML (application/x-www-form-urlencoded)
    @PostMapping("/login")
    public RedirectView loginForm(User user) {
        User existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
            // Puoi salvare il token in un cookie o in un header se fai fetch
            return new RedirectView("/home.html?token=" + jwtUtil.generateToken(existingUser.getUsername()));
        }
        return new RedirectView("/login.html?error=invalid");
    }

    // Per chiamate API JSON
    @PostMapping("/api/auth/register")
    public ResponseEntity<String> register(@RequestBody UserRegistrationRequest request) {
        if (userRepository.findByUsername(request.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username non disponibile");
        }
        if (userRepository.findByEmail(request.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email già registrata");
        }

        request.setPassword(passwordEncoder.encode(request.getPassword()));

        // Salva solo username + password in auth-service
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        UserProfileRequest profile = new UserProfileRequest();
        profile.setTelefono(request.getTelefono());
        profile.setCitta(request.getCitta());
        profile.setCap(request.getCap());

        // Envía los datos al user-service
        RestTemplate restTemplate = new RestTemplate();
        try {
            restTemplate.postForEntity("http://localhost:8081/api/user/profile", profile, Void.class);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registrazione utente fallita nel user-service");
        }

        return ResponseEntity.ok("Registrazione completata");
    }

    @PostMapping("/api/auth/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser != null && passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            String token = jwtUtil.generateToken(existingUser.getUsername());
            return ResponseEntity.ok(new AuthResponse(token));
        }
        return ResponseEntity.status(401).body("Credenziali errate");
    }

    static class AuthResponse {
        private String token;
        public AuthResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}