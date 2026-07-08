package com.raj.arena.service;

import com.raj.arena.model.Match;
import com.raj.arena.model.Problem;
import com.raj.arena.model.User;
import com.raj.arena.repository.MatchRepository;
import com.raj.arena.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

@Service
public class MatchmakingService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private MatchService matchService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ProblemService problemService;

    private static final String QUEUE = "matchmaking_queue";
    private static final long TTL_MS = 60_000;
    private static final long BROADEN_WAIT_MS = 15_000;
    private static final int ELO_WINDOW = 100;
    private static final int ELO_WINDOW_BROAD = 300;
    private final Random random = new Random();

    public void addToQueue(Long userId) {
        redisTemplate.opsForZSet().add(QUEUE, userId.toString(), System.currentTimeMillis());
    }

    public void removeFromQueue(Long userId) {
        redisTemplate.opsForZSet().remove(QUEUE, userId.toString());
    }

    /**
     * Join the queue and find an opponent within Elo range.
     * Scans all waiting entries and picks the first whose Elo is within
     * ±ELO_WINDOW of the current user. If an opponent has been waiting
     * longer than BROADEN_WAIT_MS, the window expands to ±ELO_WINDOW_BROAD.
     * Stale (deleted user) entries and those with active matches are skipped.
     * If no suitable opponent is found, the current user is added to the queue.
     */
    public void joinAndMatch(Long userId) {
        long now = System.currentTimeMillis();

        // Purge entries older than TTL_MS
        redisTemplate.opsForZSet().removeRangeByScore(QUEUE, 0, now - TTL_MS);

        User currentUser = userRepository.findById(userId).orElse(null);
        if (currentUser == null) {
            System.out.println("User " + userId + " not found, cannot join queue");
            return;
        }
        int userElo = currentUser.getElo();

        // Scan all waiting entries
        Set<String> all = redisTemplate.opsForZSet().range(QUEUE, 0, -1);
        if (all != null) {
            for (String opponent : all) {
                if (opponent.equals(userId.toString())) continue;

                Long opponentId = Long.parseLong(opponent);
                if (!userRepository.existsById(opponentId)) {
                    System.out.println("Skipping stale queue entry: " + opponent);
                    continue;
                }

                if (matchRepository.findActiveMatchByUser(opponentId).isPresent()) {
                    System.out.println("Opponent " + opponent + " has active match — skipping");
                    continue;
                }

                User opponentUser = userRepository.findById(opponentId).orElse(null);
                if (opponentUser == null) continue;

                // Broaden Elo window if opponent has been waiting long
                Double opponentScore = redisTemplate.opsForZSet().score(QUEUE, opponent);
                long waitTime = opponentScore != null ? now - opponentScore.longValue() : 0;
                int maxEloDiff = waitTime > BROADEN_WAIT_MS ? ELO_WINDOW_BROAD : ELO_WINDOW;

                if (Math.abs(userElo - opponentUser.getElo()) > maxEloDiff) {
                    System.out.println("Opponent " + opponent + " elo " + opponentUser.getElo()
                            + " outside window (" + maxEloDiff + ") for user elo " + userElo);
                    continue;
                }

                // Found a match — remove opponent from queue and create match
                redisTemplate.opsForZSet().remove(QUEUE, opponent);

                int elo = currentUser.getElo();
                List<Problem> eligible = problemService.getProblemsByEloRange(elo);
                Long problemId = eligible.isEmpty() ? 1L : eligible.get(random.nextInt(eligible.size())).getId();
                Match match = matchService.createMatch(opponentId, userId, problemId);
                System.out.println("Match created: " + opponentId + " (elo " + opponentUser.getElo() + ") vs "
                        + userId + " (elo " + userElo + ")");
                messagingTemplate.convertAndSend("/topic/match/" + opponent, match);
                messagingTemplate.convertAndSend("/topic/match/" + userId, match);
                return;
            }
        }

        // No match found — add self to queue
        redisTemplate.opsForZSet().add(QUEUE, userId.toString(), now);
        System.out.println("No opponent found within Elo range, " + userId + " added to queue");
    }

    public Optional<Match> findActiveMatch(Long userId) {
        return matchRepository.findActiveMatchByUser(userId);
    }
}