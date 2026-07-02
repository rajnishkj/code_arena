package com.raj.arena.repository;

import com.raj.arena.model.SolvedProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SolvedProblemRepository extends JpaRepository<SolvedProblem, Long> {

    @Query("SELECT sp.userId, COUNT(sp) FROM SolvedProblem sp " +
            "WHERE sp.solvedAt >= :startOfDay " +
            "GROUP BY sp.userId " +
            "ORDER BY COUNT(sp) DESC")
    List<Object[]> findDailySolveCounts(@Param("startOfDay") LocalDateTime startOfDay);
}
