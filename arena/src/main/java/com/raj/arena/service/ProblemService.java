package com.raj.arena.service;

import com.raj.arena.model.Problem;
import com.raj.arena.repository.ProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProblemService {

    @Autowired
    private ProblemRepository problemRepository;

    public Problem createProblem(Problem problem) {
        return problemRepository.save(problem);
    }

    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }

    public List<Problem> getProblemsByEloRange(int elo) {
        return problemRepository.findAll().stream()
                .filter(p -> Math.abs(p.getEloRange() - elo) <= 200)
                .collect(Collectors.toList());
    }
}
