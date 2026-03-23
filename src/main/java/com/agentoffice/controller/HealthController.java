package com.agentoffice.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final ApplicationContext applicationContext;

    @Value("${spring.datasource.url:NOT_FOUND}")
    private String datasourceUrl;

    @Value("${spring.data.redis.host:NOT_FOUND}")
    private String redisHost;

    @Value("${spring.data.redis.port:NOT_FOUND}")
    private String redisPort;

    @Value("${spring.application.name:NOT_FOUND}")
    private String appName;

    public HealthController(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", Instant.now().toString());
        healthInfo.put("application", applicationContext.getId());
        healthInfo.put("appName", applicationContext.getApplicationName());

        return ResponseEntity.ok(healthInfo);
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> readiness = new HashMap<>();
        readiness.put("ready", true);
        readiness.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(readiness);
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> live() {
        Map<String, Object> liveness = new HashMap<>();
        liveness.put("alive", true);
        liveness.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(liveness);
    }

    @GetMapping("/config-test")
    public ResponseEntity<Map<String, Object>> configTest() {
        Map<String, Object> config = new HashMap<>();
        config.put("appName", appName);
        config.put("datasourceUrl", datasourceUrl);
        config.put("redisHost", redisHost);
        config.put("redisPort", redisPort);
        config.put("source", "Nacos Config Center");
        return ResponseEntity.ok(config);
    }
}