package com.raj.arena.repository;

import com.raj.arena.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("SELECT m FROM Match m WHERE (m.p1 = :userId OR m.p2 = :userId) AND m.winner IS NULL ORDER BY m.id DESC")
    Optional<Match> findActiveMatchByUser(@Param("userId") Long userId);
}
