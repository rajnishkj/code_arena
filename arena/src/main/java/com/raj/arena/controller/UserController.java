package com.raj.arena.controller;

import com.raj.arena.dto.DailyLeaderboardEntry;
import com.raj.arena.model.User;
import com.raj.arena.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/id/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User updated = userService.updateUser(id, body.get("name"), body.get("email"));
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        return userService.getUserByUsername(username)
                .map(user -> {
                    if (password != null && password.equals(user.getEncrypted_password())) {
                        return ResponseEntity.ok((Object) user);
                    }
                    return ResponseEntity.status(401)
                            .body((Object) Map.of("error", "Incorrect password"));
                })
                .orElse(ResponseEntity.status(404)
                        .body(Map.of("error", "User not found")));
    }

}
