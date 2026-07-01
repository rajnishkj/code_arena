package com.raj.arena.service;

import com.raj.arena.model.User;
import com.raj.arena.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User updateElo(Long userId, int eloChange) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setElo(user.getElo() + eloChange);
        return userRepository.save(user);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User createGuest() {
        User guest = new User();
        guest.setUsername("Guest" + System.currentTimeMillis());
        guest.setName("Guest");
        guest.setElo(800);
        guest.setGuest(true);
        guest.setCreated_at(LocalDateTime.now());
        return userRepository.save(guest);
    }

    public List<User> getLeaderboard() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "elo"));
    }
}
