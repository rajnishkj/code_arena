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

    public User updateUser(Long id, String name, String email) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (name != null) user.setName(name);
        if (email != null) user.setEmail(email);
        return userRepository.save(user);
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
}
