package com.personalwebsite.controller;
 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
 
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
 
/**
 * 健康检查控制器
 * 用于测试后端服务是否正常运行
 */
@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {
 
    private final LocalDateTime startTime = LocalDateTime.now();
 
    /**
     * 健康检查接口
     * GET /api/health
     * 返回服务状态和运行信息
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
 
        health.put("status", "UP");
        health.put("service", "Personal Website Backend");
        health.put("version", "1.0.0");
        health.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        health.put("startTime", startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        health.put("uptime", getUptime());
 
        // 系统信息
        Map<String, Object> system = new HashMap<>();
        system.put("javaVersion", System.getProperty("java.version"));
        system.put("osName", System.getProperty("os.name"));
        system.put("osVersion", System.getProperty("os.version"));
        system.put("availableProcessors", Runtime.getRuntime().availableProcessors());
 
        // 内存信息
        Runtime runtime = Runtime.getRuntime();
        Map<String, String> memory = new HashMap<>();
        memory.put("total", formatBytes(runtime.totalMemory()));
        memory.put("free", formatBytes(runtime.freeMemory()));
        memory.put("used", formatBytes(runtime.totalMemory() - runtime.freeMemory()));
        memory.put("max", formatBytes(runtime.maxMemory()));
 
        health.put("system", system);
        health.put("memory", memory);
 
        return ResponseEntity.ok(health);
    }
 
    /**
     * 简单的 ping 接口
     * GET /api/health/ping
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "pong");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return ResponseEntity.ok(response);
    }
 
    /**
     * 计算服务运行时间
     */
    private String getUptime() {
        long uptimeSeconds = java.time.Duration.between(startTime, LocalDateTime.now()).getSeconds();
        long days = uptimeSeconds / 86400;
        long hours = (uptimeSeconds % 86400) / 3600;
        long minutes = (uptimeSeconds % 3600) / 60;
        long seconds = uptimeSeconds % 60;
 
        if (days > 0) {
            return String.format("%d天 %d小时 %d分钟 %d秒", days, hours, minutes, seconds);
        } else if (hours > 0) {
            return String.format("%d小时 %d分钟 %d秒", hours, minutes, seconds);
        } else if (minutes > 0) {
            return String.format("%d分钟 %d秒", minutes, seconds);
        } else {
            return String.format("%d秒", seconds);
        }
    }
 
    /**
     * 格式化字节数
     */
    private String formatBytes(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return String.format("%.2f KB", bytes / 1024.0);
        } else if (bytes < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
        } else {
            return String.format("%.2f GB", bytes / (1024.0 * 1024.0 * 1024.0));
        }
    }
}