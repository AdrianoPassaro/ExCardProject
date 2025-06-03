package com.gruppo12.authentication_autorization.service;

import com.gruppo12.authentication_autorization.model.User;
import com.gruppo12.authentication_autorization.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public boolean register(User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return false; // già esistente
        }
        userRepository.save(user);
        return true;
    }

    public boolean login(User user) {
        User existing = userRepository.findByUsername(user.getUsername());
        return existing != null && existing.getPassword().equals(user.getPassword());
    }
}
