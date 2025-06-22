package com.gruppo12.gestione_utente.service;

import com.gruppo12.gestione_utente.model.UserProfile;
import com.gruppo12.gestione_utente.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserProfileRepository profileRepository;

    // Método para obtener perfil (usado por GET /profile)
    public UserProfile getProfile(String username) {
        return profileRepository.findByUsername(username);
    }

    // Método para actualización parcial (usado por PATCH /profile)
    public UserProfile updateProfileFields(String username, Map<String, String> updates) {
        UserProfile profile = profileRepository.findByUsername(username);
        if (profile != null) {
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
            return profileRepository.save(profile);
        }
        return null;
    }
}





