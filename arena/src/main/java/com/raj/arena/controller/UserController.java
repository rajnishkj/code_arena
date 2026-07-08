package com.raj.arena.controller;

import com.raj.arena.dto.DailyLeaderboardEntry;
import com.raj.arena.model.User;
import com.raj.arena.service.UserService;
import com.raj.arena.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        User created = userService.createUser(user);
        String token = jwtUtil.generateToken(created.getId(), created.getUsername());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", created.getId(),
                "username", created.getUsername(),
                "elo", created.getElo()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        return userService.authenticate(username, password)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getId(), user.getUsername());
                    return ResponseEntity.ok((Object) Map.of(
                            "token", token,
                            "userId", user.getId(),
                            "username", user.getUsername(),
                            "elo", user.getElo()
                    ));
                })
                .orElse(ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid username or password")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "elo", user.getElo(),
                "name", user.getName() != null ? user.getName() : "",
                "email", user.getEmail() != null ? user.getEmail() : ""
        ));
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

    @GetMapping("/id/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        Long authedUser = (Long) auth.getPrincipal();
        if (!authedUser.equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Cannot update another user's profile"));
        }
        User updated = userService.updateUser(id, body.get("name"), body.get("email"));
        return ResponseEntity.ok(updated);
    }
}
