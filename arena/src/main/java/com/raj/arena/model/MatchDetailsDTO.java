package com.raj.arena.model;

public class MatchDetailsDTO {
    private final Long matchId;
    private final Long p1Id;
    private final Long p2Id;
    private final String p1Username;
    private final String p2Username;
    private final Long problemId;

    public MatchDetailsDTO(Long matchId, Long p1Id, Long p2Id, String p1Username, String p2Username, Long problemId) {
        this.matchId = matchId;
        this.p1Id = p1Id;
        this.p2Id = p2Id;
        this.p1Username = p1Username;
        this.p2Username = p2Username;
        this.problemId = problemId;
    }

    public Long getMatchId() { return matchId; }
    public Long getP1Id() { return p1Id; }
    public Long getP2Id() { return p2Id; }
    public String getP1Username() { return p1Username; }
    public String getP2Username() { return p2Username; }
    public Long getProblemId() { return problemId; }
}