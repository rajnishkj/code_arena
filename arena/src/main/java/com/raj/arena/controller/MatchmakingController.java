package com.raj.arena.controller;

import com.raj.arena.service.MatchmakingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    @Autowired
    private MatchmakingService matchmakingService;

    @PostMapping("/join")
    public ResponseEntity<?> joinQueue(@RequestParam Long userId) {
        matchmakingService.joinAndMatch(userId);
        return ResponseEntity.ok("Searching");
    }

    @GetMapping("/status")
    public ResponseEntity<?> checkStatus(@RequestParam Long userId) {
        return matchmakingService.findActiveMatch(userId)
                .map(match -> ResponseEntity.ok((Object) match))
                .orElse(ResponseEntity.ok(Map.of("matched", false)));
    }

    @PostMapping("/leave")
    public ResponseEntity<?> leaveQueue(@RequestParam Long userId) {
        matchmakingService.removeFromQueue(userId);
        return ResponseEntity.ok("Removed from queue");
    }

}
