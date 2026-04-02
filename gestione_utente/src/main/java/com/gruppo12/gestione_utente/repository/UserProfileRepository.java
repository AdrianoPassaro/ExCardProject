package com.gruppo12.gestione_utente.repository;

import com.gruppo12.gestione_utente.model.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserProfileRepository extends MongoRepository<UserProfile, String> {
    UserProfile findByUsername(String username);

    UserProfile findByUserId(String userId);
}





