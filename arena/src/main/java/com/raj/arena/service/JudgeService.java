package com.raj.arena.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JudgeService {

    private static final String PISTON_URL = "http://localhost:2000/api/v2/execute";;

    public String executeCode(String sourceCode, String language, String version, String stdin) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("User-Agent", "code-arena-app");

        Map<String, Object> file = new HashMap<>();
        file.put("content", sourceCode);

        Map<String, Object> body = new HashMap<>();
        body.put("language", language);
        body.put("version", version);
        body.put("files", List.of(file));
        body.put("stdin", stdin);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        Map<String, Object> response = restTemplate.postForObject(PISTON_URL, request, Map.class);

        if (response == null) return "No response";

        Map<?, ?> run = (Map<?, ?>) response.get("run");
        String output = (String) run.get("output");
        return output != null ? output : "No output";
    }
}