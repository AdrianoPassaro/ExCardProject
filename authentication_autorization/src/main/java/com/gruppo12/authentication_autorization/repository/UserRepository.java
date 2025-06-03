package com.gruppo12.authentication_autorization.repository;

import com.gruppo12.authentication_autorization.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
    User findByEmail(String email);
}