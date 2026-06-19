package com.raj.arena.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @MessageMapping("/match.join")
    @SendTo("/topic/match")
    public String joinMatch(String message) {
        return message;
    }
}

