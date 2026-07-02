package com.raj.arena.service;

import com.raj.arena.dto.DailyLeaderboardEntry;
import com.raj.arena.model.User;
import com.raj.arena.repository.SolvedProblemRepository;
import com.raj.arena.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SolvedProblemRepository solvedProblemRepository;

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
        return userRepository.findByIsGuestFalseOrderByEloDesc();
    }

    public List<DailyLeaderboardEntry> getDailyLeaderboard() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        List<Object[]> rows = solvedProblemRepository.findDailySolveCounts(startOfDay);
        List<DailyLeaderboardEntry> result = new ArrayList<>();
        for (Object[] row : rows) {
            Long userId = (Long) row[0];
            long count = (long) row[1];
            userRepository.findById(userId).ifPresent(user -> {
                if (!user.isGuest()) {
                    result.add(new DailyLeaderboardEntry(user.getUsername(), count));
                }
            });
        }
        return result;
    }

    public User upgradeGuest(Long guestId, String name, String username, String email, String password) {
        User user = userRepository.findById(guestId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isGuest()) {
            throw new IllegalStateException("Account is already registered");
        }
        if (userRepository.existsByUsernameAndIsGuestFalse(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken. Please choose another.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        user.setName(name);
        user.setUsername(username);
        user.setEmail(email);
        user.setEncrypted_password(password);
        user.setGuest(false);

        return userRepository.save(user);
    }
}
