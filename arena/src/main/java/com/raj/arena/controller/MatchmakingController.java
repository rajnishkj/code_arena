package com.raj.arena.controller;

import com.raj.arena.service.MatchmakingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    @Autowired
    private MatchmakingService matchmakingService;

    @PostMapping("/join")
    public ResponseEntity<?> joinQueue(@RequestParam Long userId,
            @RequestParam(defaultValue = "1") Long problemId) {
        matchmakingService.joinAndMatch(userId, problemId);
        return ResponseEntity.ok("Searching");
    }

    @PostMapping("/leave")
    public ResponseEntity<?> leaveQueue(@RequestParam Long userId) {
        matchmakingService.removeFromQueue(userId);
        return ResponseEntity.ok("Removed from queue");
    }

}
