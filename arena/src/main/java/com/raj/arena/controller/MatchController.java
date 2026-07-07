package com.raj.arena.controller;

import com.raj.arena.model.Match;
import com.raj.arena.service.HeartbeatTracker;
import com.raj.arena.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
            @RequestParam Long winner,
            @RequestParam int p1Time,
            @RequestParam int p2Time) {
        return ResponseEntity.ok(matchService.completeMatch(matchId, winner, p1Time, p2Time));
    }

    @PostMapping("/forfeit")
    public ResponseEntity<Match> forfeitMatch(
            @RequestParam Long matchId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(matchService.forfeitMatch(matchId, userId));
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(
            @RequestParam Long matchId,
            @RequestParam Long userId) {
        heartbeatTracker.beat(String.valueOf(matchId), userId);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/heartbeat/status")
    public ResponseEntity<?> heartbeatStatus(
            @RequestParam Long matchId,
            @RequestParam Long userId,
            @RequestParam Long opponentId) {
        boolean alive = heartbeatTracker.isAlive(
                String.valueOf(matchId), opponentId);
        return ResponseEntity.ok(Map.of("opponentAlive", alive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMatch(@PathVariable Long id) {
        return matchService.getMatchDetails(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}


