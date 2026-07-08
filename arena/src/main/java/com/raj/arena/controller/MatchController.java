package com.raj.arena.controller;

import com.raj.arena.model.Match;
import com.raj.arena.service.HeartbeatTracker;
import com.raj.arena.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    @Autowired
    private MatchService matchService;

    @Autowired
    private HeartbeatTracker heartbeatTracker;

    @PostMapping("/create")
    public ResponseEntity<Match> createMatch(
            @RequestParam Long p1,
            @RequestParam Long p2,
            @RequestParam Long problemId) {
        return ResponseEntity.ok(matchService.createMatch(p1, p2, problemId));
    }

    @PostMapping("/complete")
    public ResponseEntity<Match> completeMatch(
            @RequestParam Long matchId,
            Authentication auth) {
        Long winner = (Long) auth.getPrincipal();
        return ResponseEntity.ok(matchService.completeMatch(matchId, winner));
    }

    @PostMapping("/forfeit")
    public ResponseEntity<Match> forfeitMatch(
            @RequestParam Long matchId,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(matchService.forfeitMatch(matchId, userId));
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(
            @RequestParam Long matchId,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        heartbeatTracker.beat(String.valueOf(matchId), userId);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/heartbeat/status")
    public ResponseEntity<?> heartbeatStatus(
            @RequestParam Long matchId,
            @RequestParam Long opponentId,
            Authentication auth) {
        String matchKey = String.valueOf(matchId);
        boolean alive = heartbeatTracker.isAlive(matchKey, opponentId);
        return ResponseEntity.ok(Map.of("opponentAlive", alive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMatch(@PathVariable Long id) {
        return matchService.getMatchDetails(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
