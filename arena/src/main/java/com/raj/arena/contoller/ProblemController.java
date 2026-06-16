package com.raj.arena.contoller;

import com.raj.arena.model.Problem;
import com.raj.arena.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    @Autowired
    private ProblemService problemService;

    @PostMapping("/create")
    public ResponseEntity<Problem> createProblem(@RequestBody Problem problem) {
        return ResponseEntity.ok(problemService.createProblem(problem));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblem(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @GetMapping("/for-elo/{elo}")
    public ResponseEntity<List<Problem>> getProblemsForElo(@PathVariable int elo) {
        return ResponseEntity.ok(problemService.getProblemsByEloRange(elo));
    }
}