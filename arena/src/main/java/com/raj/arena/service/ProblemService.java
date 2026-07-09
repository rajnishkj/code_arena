package com.raj.arena.service;

import com.raj.arena.model.Problem;
import com.raj.arena.model.TestCase;
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
        if (problem.getTestCases() != null) {
            problem.getTestCases().forEach(tc -> tc.setProblem(problem));
        }
        return problemRepository.save(problem);
    }

    public Problem updateProblem(Long id, Problem updated) {
        Problem existing = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setInputFormat(updated.getInputFormat());
        existing.setOutputFormat(updated.getOutputFormat());
        existing.setConstraints(updated.getConstraints());
        existing.setDifficulty(updated.getDifficulty());
        existing.setRating(updated.getRating());
        existing.setAvgSolvingTime(updated.getAvgSolvingTime());

        if (updated.getTestCases() != null) {
            existing.getTestCases().clear();
            for (TestCase tc : updated.getTestCases()) {
                tc.setProblem(existing);
                tc.setId(null);
                existing.getTestCases().add(tc);
            }
        }

        return problemRepository.save(existing);
    }

    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }

    public List<Problem> getProblemsByEloRange(int elo) {
        return problemRepository.findAll().stream()
                .filter(p -> Math.abs(p.getRating() - elo) <= 200)
                .collect(Collectors.toList());
    }
}
