package com.gruppo12.payment.repository;

import com.gruppo12.payment.model.Wallet;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface WalletRepository extends MongoRepository<Wallet, String> {
    Optional<Wallet> findByUsername(String username);
}
