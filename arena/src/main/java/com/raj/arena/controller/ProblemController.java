package com.raj.arena.controller;

import com.raj.arena.model.Problem;
import com.raj.arena.model.User;
import com.raj.arena.service.ProblemService;
import com.raj.arena.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    @Autowired
    private ProblemService problemService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createProblem(@Valid @RequestBody Problem problem, Authentication auth) {
        User user = userService.getUserById((Long) auth.getPrincipal());
        if (!user.isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(problemService.createProblem(problem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProblem(@PathVariable Long id, @Valid @RequestBody Problem problem, Authentication auth) {
        User user = userService.getUserById((Long) auth.getPrincipal());
        if (!user.isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        return ResponseEntity.ok(problemService.updateProblem(id, problem));
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> createProblems(@RequestBody List<@Valid Problem> problems, Authentication auth) {
        User user = userService.getUserById((Long) auth.getPrincipal());
        if (!user.isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        List<Problem> created = problems.stream()
                .map(problemService::createProblem)
                .toList();
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProblem(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @GetMapping("/for-elo/{elo}")
    public ResponseEntity<List<Problem>> getProblemsForElo(@PathVariable int elo) {
        return ResponseEntity.ok(problemService.getProblemsByEloRange(elo));
    }
}