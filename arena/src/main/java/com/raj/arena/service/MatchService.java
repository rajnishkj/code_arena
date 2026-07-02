package com.raj.arena.service;

import com.raj.arena.model.Match;
import com.raj.arena.model.MatchDetailsDTO;
import com.raj.arena.model.SolvedProblem;
import com.raj.arena.model.User;
import com.raj.arena.repository.MatchRepository;
import com.raj.arena.repository.SolvedProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private SolvedProblemRepository solvedProblemRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Match createMatch(Long p1, Long p2, Long problemId) {
        Match match = new Match();
        match.setP1(p1);
        match.setP2(p2);
        match.setProblemId(problemId);
        return matchRepository.save(match);
    }

    public Match completeMatch(Long matchId, Long winner, int p1Time, int p2Time) {
        System.out.println("completeMatch called for matchId: " + matchId);

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

        Match saved = matchRepository.save(match);

        // Record a solve for both players (rewarding participation)
        LocalDateTime now = LocalDateTime.now();
        SolvedProblem sp1 = new SolvedProblem(null, match.getP1(), match.getProblemId(), now);
        SolvedProblem sp2 = new SolvedProblem(null, match.getP2(), match.getProblemId(), now);
        solvedProblemRepository.save(sp1);
        solvedProblemRepository.save(sp2);

        messagingTemplate.convertAndSend("/topic/match-result/" + match.getP1(), saved);
        messagingTemplate.convertAndSend("/topic/match-result/" + match.getP2(), saved);

        return saved;
    }

    public Optional<MatchDetailsDTO> getMatchDetails(Long matchId) {
        return matchRepository.findById(matchId).map(match -> {
            User p1 = userService.getUserById(match.getP1());
            User p2 = userService.getUserById(match.getP2());
            return new MatchDetailsDTO(
                    match.getId(),
                    match.getP1(), match.getP2(),
                    p1.getUsername(), p2.getUsername(),
                    match.getProblemId());
        });
    }
}
