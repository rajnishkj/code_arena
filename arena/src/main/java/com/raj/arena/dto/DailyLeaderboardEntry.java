package com.raj.arena.dto;

public class DailyLeaderboardEntry {
    private String username;
    private long solveCount;

    public DailyLeaderboardEntry(String username, long solveCount) {
        this.username = username;
        this.solveCount = solveCount;
    }

    public String getUsername() {
        return username;
    }

    public long getSolveCount() {
        return solveCount;
    }
}
