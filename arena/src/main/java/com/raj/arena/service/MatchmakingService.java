package com.raj.arena.service;

import com.raj.arena.model.Match;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class MatchmakingService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private MatchService matchService;

    private static final String QUEUE = "matchmaking_queue";

    public void addToQueue(Long userId) {
        redisTemplate.opsForList().rightPush(QUEUE, userId.toString());
    }

    public void removeFromQueue(Long userId) {
        redisTemplate.opsForList().remove(QUEUE, 1, userId.toString());
    }

    public Match tryMatch(Long userId, Long problemId) {
        String opponent = redisTemplate.opsForList().leftPop(QUEUE);

        if (opponent == null || opponent.equals(userId.toString())) {
            addToQueue(userId);
            return null;
        }

        return matchService.createMatch(userId, Long.parseLong(opponent), problemId);
    }
}
