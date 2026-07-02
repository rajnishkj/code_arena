package com.raj.arena.service;

import com.raj.arena.model.Match;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class MatchmakingService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private MatchService matchService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private static final String QUEUE = "matchmaking_queue";

    public void addToQueue(Long userId) {
        redisTemplate.opsForList().rightPush(QUEUE, userId.toString());
    }

    public void removeFromQueue(Long userId) {
        redisTemplate.opsForList().remove(QUEUE, 1, userId.toString());
    }

    public void tryMatch(Long userId, Long problemId) {
        String opponent = redisTemplate.opsForList().leftPop(QUEUE);

        System.out.println("tryMatch called by: " + userId + ", popped: " + opponent);
        if (opponent == null || opponent.equals(userId.toString())) {
            addToQueue(userId);
            return;
        }

        Match match = matchService.createMatch(Long.parseLong(opponent), userId, problemId);

        System.out.println("Sending match to opponent: " + opponent + " and user: " + userId);
        messagingTemplate.convertAndSend("/topic/match/" + opponent, match);
        messagingTemplate.convertAndSend("/topic/match/" + userId, match);
    }
}