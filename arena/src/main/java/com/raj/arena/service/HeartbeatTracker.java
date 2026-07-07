package com.raj.arena.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class HeartbeatTracker {

    private final ConcurrentHashMap<String, Long> lastAlive = new ConcurrentHashMap<>();
    private static final long STALE_MS = 6_000;

    public void beat(String matchId, Long userId) {
        lastAlive.put(matchId + ":" + userId, System.currentTimeMillis());
    }

    public boolean isAlive(String matchId, Long userId) {
        Long ts = lastAlive.get(matchId + ":" + userId);
        return ts != null && (System.currentTimeMillis() - ts) < STALE_MS;
    }

    public long getLastHeartbeatMillis(String matchId, Long userId) {
        Long ts = lastAlive.get(matchId + ":" + userId);
        return ts != null ? ts : 0L;
    }

    public void clear(String matchId) {
        lastAlive.keySet().removeIf(k -> k.startsWith(matchId + ":"));
    }
}
