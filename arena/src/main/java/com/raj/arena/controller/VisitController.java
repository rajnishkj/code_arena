package com.raj.arena.controller;

import com.raj.arena.service.VisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/visits")
public class VisitController {

    @Autowired
    private VisitService visitService;

    @PostMapping
    public ResponseEntity<Map<String, Integer>> recordVisit() {
        int count = visitService.incrementAndGetCount();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
