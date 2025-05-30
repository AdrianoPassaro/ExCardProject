package com.gruppo12.demo.controller;

import com.gruppo12.demo.model.User;
import com.gruppo12.demo.repository.UserRepository;
import com.gruppo12.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class AuthRestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

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
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Utente già esistente");
        }
        userRepository.save(user);
        return ResponseEntity.ok("Registrazione completata");
    }

    @PostMapping("/api/auth/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
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



