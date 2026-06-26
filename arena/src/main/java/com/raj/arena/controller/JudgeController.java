package com.raj.arena.controller;

import com.raj.arena.service.JudgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/judge")
public class JudgeController {

    @Autowired
    private JudgeService judgeService;

    @PostMapping("/execute")
    public ResponseEntity<String> execute(
            @RequestParam String language,
            @RequestParam String version,
            @RequestParam String stdin,
            @RequestBody String sourceCode) {
        String result = judgeService.executeCode(sourceCode, language, version, stdin);
        return ResponseEntity.ok(result);
    }
}
