package com.raj.arena.repository;

import com.raj.arena.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query(value = "SELECT * FROM matches WHERE (p1 = :userId OR p2 = :userId) AND winner IS NULL ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<Match> findActiveMatchByUser(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM matches WHERE winner IS NULL ORDER BY id ASC LIMIT 50", nativeQuery = true)
    List<Match> findUnfinishedMatches();
}
