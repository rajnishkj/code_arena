package com.raj.arena.service;

import com.raj.arena.model.Match;
import com.raj.arena.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private UserService userService;

    public Match createMatch(Long p1, Long p2, Long problemId) {
        Match match = new Match();
        match.setP1(p1);
        match.setP2(p2);
        match.setProblemId(problemId);
        return matchRepository.save(match);
    }

    public Match completeMatch(Long matchId, Long winner, int p1Time, int p2Time) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        match.setWinner(winner);
        match.setP1Time(p1Time);
        match.setP2Time(p2Time);

        // Elo calculation
        int p1EloChange = winner.equals(match.getP1()) ? 16 : -16;
        int p2EloChange = winner.equals(match.getP2()) ? 16 : -16;

        match.setP1EloChange(p1EloChange);
        match.setP2EloChange(p2EloChange);

        userService.updateElo(match.getP1(), p1EloChange);
        userService.updateElo(match.getP2(), p2EloChange);

        return matchRepository.save(match);
    }
}
