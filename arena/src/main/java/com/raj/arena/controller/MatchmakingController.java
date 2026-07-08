package com.raj.arena.controller;

import com.raj.arena.service.MatchmakingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    @Autowired
    private MatchmakingService matchmakingService;

    @PostMapping("/join")
    public ResponseEntity<?> joinQueue(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        matchmakingService.joinAndMatch(userId);
        return ResponseEntity.ok("Searching");
    }

    @GetMapping("/status")
    public ResponseEntity<?> checkStatus(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return matchmakingService.findActiveMatch(userId)
                .map(match -> ResponseEntity.ok((Object) match))
                .orElse(ResponseEntity.ok(Map.of("matched", false)));
    }

    @PostMapping("/leave")
    public ResponseEntity<?> leaveQueue(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        matchmakingService.removeFromQueue(userId);
        return ResponseEntity.ok("Removed from queue");
    }
}
