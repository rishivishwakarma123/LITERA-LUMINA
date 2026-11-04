package com.litera.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {
    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "application", "Litera Lumina",
                "status", "running",
                "message", "The backend API is running. Start the frontend separately to use the website.",
                "frontend", "http://localhost:5173",
                "api", "/api"
        );
    }
}
