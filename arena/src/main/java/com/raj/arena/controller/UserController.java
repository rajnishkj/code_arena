package com.raj.arena.controller;

import com.raj.arena.dto.DailyLeaderboardEntry;
import com.raj.arena.dto.UpgradeRequest;
import com.raj.arena.model.User;
import com.raj.arena.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @GetMapping("/{username}")
    public ResponseEntity<User> getUser(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<User>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }

    @GetMapping("/leaderboard/daily")
    public ResponseEntity<List<DailyLeaderboardEntry>> getDailyLeaderboard() {
        return ResponseEntity.ok(userService.getDailyLeaderboard());
    }

    @PostMapping("/guest")
    public ResponseEntity<User> createGuest() {
        User guest = userService.createGuest();
        return ResponseEntity.ok(guest);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PostMapping("/upgrade")
    public ResponseEntity<?> upgradeGuest(@RequestBody UpgradeRequest req) {
        try {
            User upgraded = userService.upgradeGuest(
                    req.getGuestId(), req.getName(), req.getUsername(), req.getEmail(), req.getPassword());
            return ResponseEntity.ok(upgraded);
        } catch (IllegalArgumentException e) {
            // username or email conflict
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            // already registered
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
