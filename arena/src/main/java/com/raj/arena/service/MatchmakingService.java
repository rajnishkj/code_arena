package com.raj.arena.service;

import com.raj.arena.model.Match;
import com.raj.arena.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class MatchmakingService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private MatchService matchService;

    @Autowired
    private UserRepository userRepository;

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
            // Pop the oldest waiting entry
            ZSetOperations.TypedTuple<String> entry = redisTemplate.opsForZSet().popMin(QUEUE);

            if (entry == null || entry.getValue() == null) {
                // Queue empty — add self and wait
                redisTemplate.opsForZSet().add(QUEUE, userId.toString(), now);
                System.out.println("No opponent found, " + userId + " added to queue");
                return;
            }

            String opponent = entry.getValue();

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

            // Valid opponent found — create match and notify both
            Match match = matchService.createMatch(opponentId, userId, problemId);
            System.out.println("Match created: " + opponentId + " vs " + userId);
            messagingTemplate.convertAndSend("/topic/match/" + opponent, match);
            messagingTemplate.convertAndSend("/topic/match/" + userId, match);
            return;
        }
    }

}