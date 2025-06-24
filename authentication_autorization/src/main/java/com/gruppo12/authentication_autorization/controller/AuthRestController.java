package com.gruppo12.authentication_autorization.controller;

import com.gruppo12.authentication_autorization.dto.UserProfileRequest;
import com.gruppo12.authentication_autorization.dto.UserRegistrationRequest;
import com.gruppo12.authentication_autorization.model.User;
import com.gruppo12.authentication_autorization.repository.UserRepository;
import com.gruppo12.authentication_autorization.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
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
        // Codifica della password per maggiore sicurezza
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return new RedirectView("/login.html?success=1");
    }

    // Per form HTML (application/x-www-form-urlencoded)
    @PostMapping("/login")
    public RedirectView loginForm(User user) {
        User existingUser = userRepository.findByUsername(user.getUsername());
        // Verifica sicura della password con passwordEncoder
        if (existingUser != null && passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            // Puoi salvare il token in un cookie o in un header se fai fetch
            return new RedirectView("/home.html?token=" + jwtUtil.generateToken(existingUser.getUsername()));
        }
        return new RedirectView("/login.html?error=invalid");
    }

    // Per chiamate API JSON
    @PostMapping("/api/auth/register")
    public ResponseEntity<String> register(@RequestBody UserRegistrationRequest request) {
        try {
            // Validaciones
            if (userRepository.findByUsername(request.getUsername()) != null) {
                return ResponseEntity.badRequest().body("Username non disponibile");
            }
            if (userRepository.findByEmail(request.getEmail()) != null) {
                return ResponseEntity.badRequest().body("Email già registrata");
            }

            // Crear usuario
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);

            // Preparar perfil
            UserProfileRequest profile = new UserProfileRequest();
            profile.setUsername(request.getUsername());
            profile.setNome(request.getNome());
            profile.setCognome(request.getCognome());
            profile.setDataNascita(request.getDataNascita());
            profile.setTelefono(request.getTelefono());
            profile.setCitta(request.getCitta());
            profile.setCap(request.getCap());
            profile.setProvincia(request.getProvincia());
            profile.setIndirizzo(request.getIndirizzo());

            // Generar token para el nuevo usuario
            String token = jwtUtil.generateToken(user.getUsername());

            // Configurar RestTemplate con headers de autenticación
            RestTemplate restTemplate = new RestTemplate();

            // Configurar timeout
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(5000);
            requestFactory.setReadTimeout(5000);
            restTemplate.setRequestFactory(requestFactory);

            // Crear headers con el token JWT
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Crear la entidad HTTP con el perfil y los headers
            HttpEntity<UserProfileRequest> requestEntity = new HttpEntity<>(profile, headers);

            // Llamar al servicio de perfil
            ResponseEntity<Void> profileResponse = restTemplate.exchange(
                    "http://management-service:8081/api/user/profile",
                    HttpMethod.POST,
                    requestEntity,
                    Void.class
            );

            if (!profileResponse.getStatusCode().is2xxSuccessful()) {
                // Se il profilo fallisce, elimino l'utente (rollback manuale)
                userRepository.delete(user);
                throw new RuntimeException("Errore in management-service. Status: " + profileResponse.getStatusCode());
            }

            return ResponseEntity.ok("Registrazione completata con successo");

        } catch (HttpStatusCodeException e) {
            System.err.println("Error del servicio de perfiles: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).body("Error del servicio de perfiles: " + e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            System.err.println("Servicio no disponible: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Servicio de perfiles no disponible");
        } catch (Exception e) {
            System.err.println("Error inesperado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno del servidor");
        }
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
