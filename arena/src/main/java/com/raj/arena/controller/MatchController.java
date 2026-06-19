package com.raj.arena.controller;

import com.raj.arena.model.Match;
import com.raj.arena.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    @Autowired
    private MatchService matchService;

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
}


