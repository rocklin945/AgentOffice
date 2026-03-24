package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
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

    @Value("${spring.application.name:NOT_FOUND}")
    private String appName;

    public HealthController(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @GetMapping("/health")
    public Result<Map<String, Object>> health() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", Instant.now().toString());
        healthInfo.put("application", applicationContext.getId());
        healthInfo.put("appName", applicationContext.getApplicationName());

        return Result.success(healthInfo);
    }

    @GetMapping("/config-test")
    public Result<Map<String, Object>> configTest() {
        Map<String, Object> config = new HashMap<>();
        config.put("appName", appName);
        return Result.success(config);
    }
}