package com.gruppo12.demo.controller;

import com.gruppo12.demo.model.User;
import com.gruppo12.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // <-- usa @RestController invece di @Controller
@RequestMapping("/api/auth")
public class AuthRestController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Utente già esistente");
        }

        userRepository.save(user);
        return ResponseEntity.ok("Registrazione avvenuta con successo");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        User existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
            return ResponseEntity.ok("Login OK");
        }
        return ResponseEntity.status(401).body("Credenziali errate");
    }
}

