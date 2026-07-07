package com.raj.arena.service;

import com.raj.arena.model.Match;
import com.raj.arena.repository.MatchRepository;
import com.raj.arena.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
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

    private static final String QUEUE = "matchmaking_queue";
    private static final long TTL_MS = 60_000; // 60 seconds

    public void addToQueue(Long userId) {
        redisTemplate.opsForZSet().add(QUEUE, userId.toString(), System.currentTimeMillis());
    }

    public void removeFromQueue(Long userId) {
        redisTemplate.opsForZSet().remove(QUEUE, userId.toString());
    }

    /**
     * Atomically join the queue and try to find an opponent.
     * Entries older than 60s are pruned first.
     * Stale (deleted user) entries are skipped.
     */
    public void joinAndMatch(Long userId, Long problemId) {
        long now = System.currentTimeMillis();

        // Purge any entries older than TTL_MS
        redisTemplate.opsForZSet().removeRangeByScore(QUEUE, 0, now - TTL_MS);

        while (true) {
            // Peek at the oldest waiting entry (range instead of popMin, Redis 3.x compat)
            Set<String> entries = redisTemplate.opsForZSet().range(QUEUE, 0, 0);

            if (entries == null || entries.isEmpty()) {
                // Queue empty — add self and wait
                redisTemplate.opsForZSet().add(QUEUE, userId.toString(), now);
                System.out.println("No opponent found, " + userId + " added to queue");
                return;
            }

            String opponent = entries.iterator().next();
            redisTemplate.opsForZSet().remove(QUEUE, opponent);

            if (opponent.equals(userId.toString())) {
                // Popped ourselves (shouldn't usually happen) — re-add and wait
                redisTemplate.opsForZSet().add(QUEUE, userId.toString(), now);
                System.out.println("Popped self (" + userId + "), re-queued");
                return;
            }

            Long opponentId = Long.parseLong(opponent);
            if (!userRepository.existsById(opponentId)) {
                // Deleted guest — discard and try next
                System.out.println("Skipping stale queue entry: " + opponent);
                continue;
            }

            if (matchRepository.findActiveMatchByUser(opponentId).isPresent()) {
                System.out.println("Opponent " + opponent + " has active match — skipping");
                continue;
            }

            // Valid opponent found — create match and notify both
            Match match = matchService.createMatch(opponentId, userId, problemId);
            System.out.println("Match created: " + opponentId + " vs " + userId);
            messagingTemplate.convertAndSend("/topic/match/" + opponent, match);
            messagingTemplate.convertAndSend("/topic/match/" + userId, match);
            return;
        }
    }

    public Optional<Match> findActiveMatch(Long userId) {
        return matchRepository.findActiveMatchByUser(userId);
    }
}