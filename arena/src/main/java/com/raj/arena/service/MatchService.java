package com.raj.arena.service;

import com.raj.arena.model.Match;
import com.raj.arena.model.User;
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

        if (match.getWinner() != null) {
            return match; // already completed, skip
        }

        match.setWinner(winner);
        match.setP1Time(p1Time);
        match.setP2Time(p2Time);

        User p1User = userService.getUserById(match.getP1());
        User p2User = userService.getUserById(match.getP2());

        int p1Elo = p1User.getElo();
        int p2Elo = p2User.getElo();

        double expectedP1 = 1.0 / (1 + Math.pow(10, (p2Elo - p1Elo) / 400.0));
        double expectedP2 = 1.0 - expectedP1;

        double actualP1 = winner.equals(match.getP1()) ? 1.0 : 0.0;
        double actualP2 = 1.0 - actualP1;

        int k = 32;

        int p1EloChange = (int) Math.round(k * (actualP1 - expectedP1));
        int p2EloChange = (int) Math.round(k * (actualP2 - expectedP2));

        match.setP1EloChange(p1EloChange);
        match.setP2EloChange(p2EloChange);

        userService.updateElo(match.getP1(), p1EloChange);
        userService.updateElo(match.getP2(), p2EloChange);

        return matchRepository.save(match);
    }
}
