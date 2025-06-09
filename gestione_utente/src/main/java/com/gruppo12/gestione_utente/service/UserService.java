package com.gruppo12.gestione_utente.service;

import com.gruppo12.gestione_utente.dto.UserProfileRequest;
import com.gruppo12.gestione_utente.model.UserProfile;
import com.gruppo12.gestione_utente.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserProfileRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Optional<UserProfile> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public UserProfile updateUser(UserProfile existing, UserProfileRequest updated) {
        existing.setNome(updated.getNome());
        existing.setCognome(updated.getCognome());
        existing.setDataNascita(updated.getDataNascita());
        existing.setIndirizzo(updated.getIndirizzo());
        existing.setCap(updated.getCap());
        existing.setCitta(updated.getCitta());
        existing.setProvincia(updated.getProvincia());
        existing.setTelefono(updated.getTelefono());
        /*if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updated.getPassword()));
        }*/
        return userRepository.save(existing);
    }
}





